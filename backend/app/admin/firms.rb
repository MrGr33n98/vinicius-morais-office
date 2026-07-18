ActiveAdmin.register Firm do
  permit_params :name, :subdomain

  action_item :sync_datajud, only: :show, if: proc { authorized?(:update, resource) } do
    link_to "Sincronizar processos ativos", sync_datajud_admin_firm_path(resource), method: :post
  end

  member_action :sync_datajud, method: :post do
    if resource.firm_api_keys.active.blank?
      redirect_to admin_firm_path(resource), alert: "Cadastre uma chave DataJud ativa antes de iniciar a sincronização da firma."
      return
    end

    matters_scope = resource.matters.where(status: "Active").where.not(court_number: [nil, ""])
    matters_count = matters_scope.count

    if matters_count.zero?
      redirect_to admin_firm_path(resource), alert: "Nenhum processo ativo com número CNJ foi encontrado para sincronizar."
      return
    end

    Datajud::FirmScheduledSyncJob.perform_later(resource.id)
    redirect_to admin_firm_path(resource), notice: "Sincronização enfileirada para #{matters_count} processo(s) ativo(s)."
  end

  index do
    selectable_column
    id_column
    column :name
    column :subdomain
    column("Chave DataJud") { |firm| status_tag(firm.firm_api_keys.active.exists? ? "ativa" : "pendente", class: firm.firm_api_keys.active.exists? ? "ok" : "warning") }
    column("Processos ativos") { |firm| firm.matters.where(status: "Active").count }
    column :created_at
    actions
  end

  filter :name
  filter :subdomain
  filter :created_at

  show do
    active_key = firm.firm_api_keys.active.order(updated_at: :desc).first
    active_matters = firm.matters.where(status: "Active").where.not(court_number: [nil, ""])
    latest_syncs = firm.process_sync_runs.includes(:matter).order(started_at: :desc).limit(5)
    sync_statuses = firm.process_data.group(:status).count

    attributes_table do
      row :name
      row :subdomain
      row :created_at
      row :updated_at
    end

    panel "Operação DataJud" do
      attributes_table_for firm do
        row("Chave ativa") { active_key ? status_tag("configurada", class: "ok") : status_tag("ausente", class: "warning") }
        row("Credencial") { active_key&.masked_key || "Nenhuma chave ativa cadastrada" }
        row("Processos ativos com CNJ") { active_matters.count }
        row("Processos com vínculo DataJud") { firm.process_data.count }
        row("Último sync executado") { latest_syncs.first&.started_at || "Ainda não executado" }
      end

      div style: "margin-top: 16px; display: flex; gap: 12px; flex-wrap: wrap;" do
        span link_to("Gerenciar chaves", admin_firm_api_keys_path(q: { firm_id_eq: firm.id }), class: "button")
        span link_to("Sincronizar processos ativos", sync_datajud_admin_firm_path(firm), method: :post, class: "button")
      end
    end

    panel "Resumo da integração" do
      table_for(sync_statuses.presence || { "pending" => 0 }) do
        column("Status") { |row| status_tag(row[0]) }
        column("Quantidade") { |row| row[1] }
      end
    end

    panel "Últimas sincronizações DataJud" do
      table_for latest_syncs do
        column :started_at
        column :finished_at
        column("Processo") { |sync| link_to(sync.matter.title, admin_matter_path(sync.matter)) }
        column("Status") { |sync| status_tag(sync.status) }
        column :movements_count
        column("Erro") { |sync| sync.error_message.to_s.truncate(100) }
      end
    end
  end

  form do |f|
    f.inputs do
      f.input :name
      f.input :subdomain
    end
    f.actions
  end
end
