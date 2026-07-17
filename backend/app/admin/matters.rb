ActiveAdmin.register Matter do
  permit_params :firm_id, :client_id, :title, :code, :court_number, :status, :current_phase

  scope :all, default: true
  scope "Ativos", ->(matters) { matters.where(status: 'Active') }
  scope "Estagnados (Sem Atualização +120 dias)", :stagnant

  index do
    selectable_column
    id_column
    column :title
    column :code
    column :court_number
    column :status
    column :current_phase
    column :client
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
      row :created_at
      row :updated_at
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
