module Datajud
  class MatterSyncJob < ApplicationJob
    queue_as :default

    discard_on ActiveRecord::RecordNotFound

    PAGE_SIZE = 100

    def perform(matter_id)
      matter = Matter.includes(:firm).find(matter_id)
      firm = matter.firm
      Current.firm = firm

      sync_run = ProcessSyncRun.create!(
        firm: firm,
        matter: matter,
        status: "running",
        started_at: Time.current
      )

      movements_count = sync_matter!(matter, firm)
      sync_run.update!(
        status: "success",
        finished_at: Time.current,
        movements_count: movements_count
      )
    rescue Datajud::ApiError => error
      update_process_data_status!(matter, error.status)
      mark_failed(sync_run, error.message, error.status)
    rescue StandardError => error
      update_process_data_status!(matter, :internal_error)
      mark_failed(sync_run, "#{error.class}: #{error.message}", :internal_error)
      raise
    ensure
      Current.reset
    end

    private

    def sync_matter!(matter, firm)
      client = Datajud::Client.new(firm: firm)
      search_response = client.search_process(matter.court_number)
      process_summary = collection_from(search_response, "processes").first

      raise Datajud::ApiError.new("Processo não encontrado no DataJud", status: 404) unless process_summary

      datajud_id = process_summary.with_indifferent_access[:id]
      raise Datajud::ApiError.new("Processo sem identificador DataJud", status: 404) if datajud_id.blank?

      process_payload = client.get_process(datajud_id)
      upsert_process_data!(matter, firm, process_payload)

      movements_count = sync_movements!(matter, firm, client, datajud_id)
      sync_parties!(matter, firm, client, datajud_id)
      movements_count
    end

    def upsert_process_data!(matter, firm, raw_process)
      mapped = Datajud::ProcessMapper.new(raw_process).attributes

      ActiveRecord::Base.transaction do
        process_datum = ProcessDatum.find_or_initialize_by(datajud_id: mapped[:process_data][:datajud_id])
        process_datum.assign_attributes(
          mapped[:process_data].merge(
            firm: firm,
            matter: matter,
            last_synced_at: Time.current
          )
        )
        process_datum.save!

        matter.update!(mapped[:matter]) if mapped[:matter].present?
      end
    end

    def sync_movements!(matter, firm, client, datajud_id)
      inserted_count = 0
      page = 0

      loop do
        raw_page = client.get_movements(datajud_id, page: page)
        movements = collection_from(raw_page, "movements")
        break if movements.empty?

        movements.each do |raw_movement|
          attrs = Datajud::MovementMapper.new(raw_movement).attributes
          next if attrs[:source_movement_id].blank?

          movement = ProcessMovement.find_or_initialize_by(
            firm: firm,
            matter: matter,
            source_movement_id: attrs[:source_movement_id]
          )
          new_record = movement.new_record?
          movement.assign_attributes(attrs)
          movement.save!

          if new_record
            inserted_count += 1
            Ai::MovementTranslationJob.perform_later(movement.id)
          end
        end

        break if movements.size < PAGE_SIZE

        page += 1
      end

      inserted_count
    end

    def sync_parties!(matter, firm, client, datajud_id)
      parties_attrs = []
      page = 0

      loop do
        raw_page = client.get_parties(datajud_id, page: page)
        parties = collection_from(raw_page, "parties")
        break if parties.empty?

        parties.each do |raw_party|
          parties_attrs << Datajud::PartyMapper.new(raw_party).attributes.merge(
            firm_id: firm.id,
            matter_id: matter.id,
            created_at: Time.current,
            updated_at: Time.current
          )
        end

        break if parties.size < PAGE_SIZE

        page += 1
      end

      ProcessParty.transaction do
        matter.process_parties.delete_all
        ProcessParty.insert_all!(parties_attrs) if parties_attrs.any?
      end
    end

    def collection_from(payload, key)
      return payload if payload.is_a?(Array)

      data = payload.with_indifferent_access
      Array(data[key] || data[:data] || data[:items] || data[:content])
    end

    def mark_failed(sync_run, message, status = nil)
      Rails.logger.error("[DataJud] matter_sync_failed message=#{message}")
      sync_run&.update!(
        status: sync_status_for(status),
        finished_at: Time.current,
        error_message: message
      )
    end

    def sync_status_for(status)
      return "not_found" if status.to_i == 404
      return "missing_api_key" if status == :missing_api_key

      "failed"
    end

    def update_process_data_status!(matter, status)
      process_datum = matter.process_datum
      return unless process_datum

      process_datum.update!(
        status: process_data_status_for(status),
        last_synced_at: Time.current
      )
    end

    def process_data_status_for(status)
      return "not_found" if status.to_i == 404
      return "failed" if status == :missing_api_key || status == :internal_error

      "failed"
    end
  end
end
