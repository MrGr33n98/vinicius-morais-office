ActiveAdmin.register ProcessSyncRun do
  actions :index, :show

  menu parent: "Processos", label: "Sincronizações DataJud", priority: 5

  scope :all, default: true
  scope("Sucesso") { |runs| runs.where(status: "success") }
  scope("Falhas") { |runs| runs.where(status: %w[failed not_found missing_api_key]) }

  index do
    selectable_column
    id_column
    column :firm
    column :matter
    column("Status") { |record| status_tag(record.status) }
    column :movements_count
    column :started_at
    column :finished_at
    column("Erro") { |record| record.error_message.to_s.truncate(80) }
    actions
  end

  filter :firm
  filter :matter
  filter :status, as: :select, collection: ProcessSyncRun::STATUSES
  filter :started_at
  filter :finished_at

  show do
    attributes_table do
      row :firm
      row :matter
      row("Status") { |record| status_tag(record.status) }
      row :movements_count
      row :started_at
      row :finished_at
      row :error_message
      row :created_at
      row :updated_at
    end
  end
end
