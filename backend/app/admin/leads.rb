ActiveAdmin.register Lead do
  permit_params :name, :email, :phone, :status, :notes

  # Filtros configurados para Ransack
  filter :name
  filter :email
  filter :status, as: :select, collection: -> { [ "Novo", "Contato Realizado", "Convertido", "Perdido" ] }
  filter :created_at

  # Scopes de exemplo
  scope :all, default: true
  scope("Novos") { |scope| scope.where(status: "Novo") }

  # Member Action customizada para teste de Spike
  member_action :contact, method: :put do
    resource.update!(status: "Contato Realizado")
    redirect_to resource_path(resource), notice: "Contato registrado para o lead!"
  end

  # Ação personalizada de lote (Batch Action)
  batch_action :convert, confirm: "Deseja converter estes leads selecionados?" do |ids|
    batch_action_collection.find(ids).each do |lead|
      lead.update!(status: "Convertido")
    end
    redirect_to collection_path, notice: "Leads convertidos com sucesso!"
  end

  # Customização do index
  index do
    selectable_column
    id_column
    column :name
    column :email
    column :phone
    column :status do |lead|
      status_tag lead.status, class: case lead.status
                                     when "Novo" then :warning
                                     when "Contato Realizado" then :info
                                     when "Convertido" then :ok
                                     else :error
                                     end
    end
    column :created_at
    actions defaults: true do |lead|
      link_to "Contatar", contact_admin_lead_path(lead), method: :put, class: "member_link"
    end
  end

  # Customização do Form
  form do |f|
    f.inputs "Detalhes do Lead" do
      f.input :name
      f.input :email
      f.input :phone
      f.input :status, as: :select, collection: [ "Novo", "Contato Realizado", "Convertido", "Perdido" ]
      f.input :notes
    end
    f.actions
  end
end
