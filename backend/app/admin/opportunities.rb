ActiveAdmin.register Opportunity do
  menu parent: "CRM & Comercial", label: "Oportunidades (CRM)", priority: 1
  permit_params :name, :email, :phone, :stage, :source, :value_estimate, :client_id, :firm_id

  index do
    selectable_column
    id_column
    column "Nome", :name
    column "E-mail", :email
    column "Contato", :phone
    column "Estágio" do |opp|
      status_tag opp.stage, class: opp.stage
    end
    column "Origem", :source
    column "Valor Estimado" do |opp|
      number_to_currency opp.value_estimate, unit: "R$ ", separator: ",", delimiter: "."
    end
    column "Escritório", :firm
    actions
  end

  filter :name, label: "Nome do Lead"
  filter :stage, as: :select, collection: %w[lead meeting proposal won lost]
  filter :source, as: :select, collection: %w[ads organico indicacao]
  filter :firm

  form do |f|
    f.inputs "Detalhes da Oportunidade" do
      f.input :firm, label: "Escritório"
      f.input :client, label: "Cliente Vinculado (Opcional)"
      f.input :name, label: "Nome do Lead"
      f.input :email, label: "E-mail"
      f.input :phone, label: "Telefone"
      f.input :stage, as: :select, collection: %w[lead meeting proposal won lost], label: "Estágio do Funil"
      f.input :source, as: :select, collection: %w[ads organico indicacao], label: "Origem da Captura"
      f.input :value_estimate, label: "Valor Estimado do Contrato (R$)"
    end
    f.actions
  end
end
