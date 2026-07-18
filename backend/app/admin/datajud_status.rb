# frozen_string_literal: true

ActiveAdmin.register_page "DataJud Status" do
  menu parent: "Processos", priority: 4, label: "Status DataJud"

  action_item :sync_all_firms, only: :index do
    link_to "Sincronizar firmas com chave ativa", sync_all_firms_admin_datajud_status_path, method: :post
  end

  action_item :retry_recent_failures, only: :index do
    link_to "Reprocessar falhas recentes", retry_recent_failures_admin_datajud_status_path, method: :post
  end

  page_action :sync_all_firms, method: :post do
    firms = Firm.joins(:firm_api_keys).merge(FirmApiKey.active).distinct.order(:id)

    if firms.none?
      redirect_to admin_datajud_status_path, alert: "Nenhuma firma com chave DataJud ativa foi encontrada."
      next
    end

    firms.each_with_index do |firm, index|
      Datajud::FirmScheduledSyncJob.set(wait: index.seconds).perform_later(firm.id)
    end

    redirect_to admin_datajud_status_path, notice: "Sincronização enfileirada para #{firms.count} firma(s) com chave ativa."
  end

  page_action :retry_recent_failures, method: :post do
    matter_ids = ProcessSyncRun
      .where(status: %w[failed not_found missing_api_key])
      .where("started_at >= ?", 24.hours.ago)
      .distinct
      .pluck(:matter_id)

    if matter_ids.empty?
      redirect_to admin_datajud_status_path, alert: "Nenhuma falha recente encontrada para reprocessar."
      next
    end

    matter_ids.each_with_index do |matter_id, index|
      Datajud::MatterSyncJob.set(wait: index.seconds).perform_later(matter_id)
    end

    redirect_to admin_datajud_status_path, notice: "Reprocessamento enfileirado para #{matter_ids.count} processo(s)."
  end

  content title: "Status DataJud" do
    active_firms = Firm.joins(:firm_api_keys).merge(FirmApiKey.active).distinct
    eligible_matters = Matter.where(status: "Active").where.not(court_number: [nil, ""])
    linked_processes = ProcessDatum.count
    movements_imported = ProcessMovement.count
    sync_runs_today = ProcessSyncRun.where("started_at >= ?", 24.hours.ago)
    failed_syncs_today = sync_runs_today.where(status: %w[failed not_found missing_api_key])
    pending_linkage = eligible_matters.left_outer_joins(:process_datum).where(process_data: { id: nil })

    columns do
      column do
        panel "Indicadores operacionais" do
          div style: "display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px;" do
            [
              ["Firmas com chave ativa", active_firms.count],
              ["Processos ativos com CNJ", eligible_matters.count],
              ["Processos vinculados", linked_processes],
              ["Movimentações importadas", movements_imported],
              ["Syncs nas últimas 24h", sync_runs_today.count],
              ["Falhas nas últimas 24h", failed_syncs_today.count]
            ].each do |label, value|
              div style: "padding: 14px; border: 1px solid #e5e7eb; background: #fff;" do
                span label, style: "display:block; font-size:12px; color:#6b7280; margin-bottom:6px;"
                strong value, style: "font-size:22px; font-weight:700; color:#111827;"
              end
            end
          end
        end

        panel "Falhas recentes da integração" do
          if failed_syncs_today.exists?
            table_for failed_syncs_today.includes(:firm, :matter).order(started_at: :desc).limit(10) do
              column :started_at
              column("Firma") { |sync| link_to(sync.firm.name, admin_firm_path(sync.firm)) }
              column("Processo") { |sync| link_to(sync.matter.title, admin_matter_path(sync.matter)) }
              column("Status") { |sync| status_tag(sync.status) }
              column("Erro") { |sync| sync.error_message.to_s.truncate(120) }
              column("Ação") { |sync| link_to("Reprocessar", retry_sync_admin_process_sync_run_path(sync), method: :post) }
            end
          else
            para "Nenhuma falha registrada nas últimas 24 horas."
          end
        end

        panel "Processos ativos ainda sem vínculo DataJud" do
          if pending_linkage.exists?
            table_for pending_linkage.includes(:firm, :client).order(updated_at: :desc).limit(10) do
              column("Processo") { |matter| link_to(matter.title, admin_matter_path(matter)) }
              column :firm
              column :client
              column :court_number
              column("Ação") { |matter| link_to("Sincronizar agora", sync_datajud_admin_matter_path(matter), method: :post) }
            end
          else
            para "Todos os processos ativos com CNJ já possuem vínculo DataJud."
          end
        end
      end

      column do
        panel "Resumo por firma" do
          firms_scope = Firm.includes(:firm_api_keys, :process_sync_runs, :process_data)

          table_for firms_scope.order(:name) do
            column("Firma") { |firm| link_to(firm.name, admin_firm_path(firm)) }
            column("Chave ativa") { |firm| status_tag(firm.firm_api_keys.any?(&:active?) ? "sim" : "não") }
            column("Ativos com CNJ") { |firm| firm.matters.where(status: "Active").where.not(court_number: [nil, ""]).count }
            column("Vinculados") { |firm| firm.process_data.count }
            column("Último sync") { |firm| firm.process_sync_runs.maximum(:started_at) || "—" }
            column("Último status") do |firm|
              last_status = firm.process_sync_runs.order(started_at: :desc).pick(:status)
              status_tag(last_status || "pending")
            end
            column("Ações") do |firm|
              safe_join([
                link_to("Abrir firma", admin_firm_path(firm)),
                " | ".html_safe,
                link_to("Sincronizar", sync_datajud_admin_firm_path(firm), method: :post)
              ])
            end
          end
        end
      end
    end
  end
end
