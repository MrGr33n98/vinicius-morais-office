module Api
  module V1
    module Portal
      class MattersController < BaseController
        before_action :authenticate_portal_user!
        before_action :ensure_client!
        before_action :set_matter

        def timeline
          render json: {
            matter: {
              id: matter.id,
              title: matter.title,
              court_number: matter.court_number
            },
            health: ProcessHealth::Calculator.calculate(matter),
            sync: sync_payload,
            movements: matter.process_movements.chronological.map do |movement|
              {
                id: movement.id,
                source_movement_id: movement.source_movement_id,
                nome: movement.nome,
                simplified_text: movement.simplified_text,
                data_hora: movement.data_hora&.iso8601,
                translated: movement.translated,
                origin: "datajud",
                source_label: "Tribunal via DataJud"
              }
            end
          }
        end

        def health
          render json: ProcessHealth::Calculator.calculate(matter).merge(sync: sync_payload)
        end

        private

        attr_reader :matter

        def ensure_client!
          return if current_client

          render json: { error: "Nenhum cliente vinculado a este usuário." }, status: :forbidden
        end

        def set_matter
          @matter = current_client.matters.find(params[:id])
        rescue ActiveRecord::RecordNotFound
          render json: { error: "Processo não encontrado." }, status: :not_found
        end

        def sync_payload
          process_datum = matter.process_datum
          latest_sync_run = matter.process_sync_runs.order(started_at: :desc).first

          {
            source: "datajud",
            source_label: "Tribunal via DataJud",
            process_data_id: process_datum&.datajud_id,
            status: process_datum&.status || latest_sync_run&.status || "pending",
            last_synced_at: process_datum&.last_synced_at&.iso8601,
            last_sync_started_at: latest_sync_run&.started_at&.iso8601,
            last_sync_finished_at: latest_sync_run&.finished_at&.iso8601,
            last_error_message: latest_sync_run&.error_message
          }
        end
      end
    end
  end
end
