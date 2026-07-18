ActiveAdmin.register Matter do
  permit_params :firm_id, :client_id, :title, :code, :court_number, :status, :current_phase

  scope :all, default: true
  scope "Ativos", ->(matters) { matters.where(status: 'Active') }
  scope "Estagnados (Sem Atualização +120 dias)", :stagnant

  action_item :sync_datajud, only: :show, if: proc { authorized?(:update, resource) && resource.court_number.present? } do
    link_to "Sincronizar DataJud", sync_datajud_admin_matter_path(resource), method: :post
  end

  member_action :sync_datajud, method: :post do
    if resource.firm&.firm_api_keys&.active.blank?
      redirect_to admin_matter_path(resource), alert: "Cadastre uma chave DataJud ativa para a firma antes de sincronizar."
      return
    end

    Datajud::MatterSyncJob.perform_later(resource.id)
    redirect_to admin_matter_path(resource), notice: "Sincronização do DataJud enfileirada com sucesso."
  end

  index do
    selectable_column
    id_column
    column :title
    column :code
    column :court_number
    column :status
    column :current_phase
    column :client
    column("DataJud") do |matter|
      if matter.process_datum&.last_synced_at
        status_tag(matter.process_datum.status)
      else
        status_tag("sem sync", class: "warning")
      end
    end
    actions
  end

  filter :title
  filter :code
  filter :court_number
  filter :status, as: :select, collection: ['Active', 'Suspended', 'Closed', 'Archived']
  filter :current_phase, as: :select, collection: ['peticao_inicial', 'contestacao', 'instrucao', 'sentenca', 'recurso', 'execucao']
  filter :client

  show do
    attributes_table do
      row :title
      row :code
      row :court_number
      row :status
      row :current_phase
      row :client
      row :firm
      row("DataJud") { |matter| matter.process_datum ? status_tag("sincronizado", class: "ok") : status_tag("pendente", class: "warning") }
      row :created_at
      row :updated_at
    end

    panel "Integração DataJud" do
      process_datum = matter.process_datum
      latest_sync = matter.process_sync_runs.order(started_at: :desc).first

      attributes_table_for matter do
        row("Processo vinculado") { process_datum&.datajud_id || "Ainda não sincronizado" }
        row("Último sync") { latest_sync&.started_at || "Ainda não executado" }
        row("Status do último sync") { latest_sync ? status_tag(latest_sync.status) : "Sem histórico" }
        row("Movimentações importadas") { matter.process_movements.count }
        row("Partes importadas") { matter.process_parties.count }
      end
    end

    panel "Últimas Sincronizações DataJud" do
      table_for matter.process_sync_runs.order(started_at: :desc).limit(5) do
        column :started_at
        column :finished_at
        column("Status") { |record| status_tag(record.status) }
        column :movements_count
        column("Erro") { |record| record.error_message.to_s.truncate(120) }
      end
    end

    panel "Movimentações Importadas do Tribunal" do
      table_for matter.process_movements.order(data_hora: :desc).limit(10) do
        column :data_hora
        column :nome
        column("Versão simplificada") { |record| record.simplified_text.to_s.truncate(120) }
        column("Traduzido?") { |record| status_tag(record.translated? ? "sim" : "não") }
      end
    end

    panel "Privacidade LGPD - Linha do Tempo e Detalhes" do
      tabs do
        tab "Movimentações Técnicas (MatterEvent - Interno)" do
          table_for matter.matter_events do
            column :event_type
            column :description
            column :happened_at
          end
        end

        tab "Notas Estratégicas (MatterInternalNote - Confidencial)" do
          table_for matter.matter_internal_notes do
            column :user
            column :content
            column :created_at
          end
        end

        tab "Atualizações Expostas (MatterClientUpdate - Portal)" do
          table_for matter.matter_client_updates do
            column :title
            column :content
            column :published_at
          end
        end
      end
    end

    active_admin_comments
  end

  form do |f|
    f.inputs do
      f.input :firm, as: :select, collection: Firm.all if current_user.has_role?(:super_admin)
      f.input :client
      f.input :title
      f.input :code
      f.input :court_number, placeholder: "0000000-00.0000.0.00.0000"
      f.input :status, as: :select, collection: ['Active', 'Suspended', 'Closed', 'Archived']
      f.input :current_phase, as: :select, collection: ['peticao_inicial', 'contestacao', 'instrucao', 'sentenca', 'recurso', 'execucao']
    end
    f.actions
  end
end
