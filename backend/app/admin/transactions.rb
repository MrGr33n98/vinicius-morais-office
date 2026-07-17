ActiveAdmin.register Transaction do
  menu parent: "Financeiro", label: "Fluxo de Caixa", priority: 1
  permit_params :amount, :transaction_type, :realized_at, :description, :matter_id, :firm_id

  index do
    selectable_column
    id_column
    column "Descrição", :description
    column "Tipo" do |t|
      status_tag t.transaction_type, class: t.transaction_type == "revenue" ? "ok" : "warn"
    end
    column "Valor" do |t|
      number_to_currency t.amount, unit: "R$ ", separator: ",", delimiter: "."
    end
    column "Realizado Em", :realized_at
    column "Processo Relacionado", :matter
    column "Escritório", :firm
    actions
  end

  filter :description, label: "Descrição"
  filter :transaction_type, as: :select, collection: %w[revenue expense], label: "Tipo"
  filter :realized_at, label: "Data de Realização"
  filter :firm

  form do |f|
    f.inputs "Detalhes do Lançamento Financeiro" do
      f.input :firm, label: "Escritório"
      f.input :matter, label: "Processo Vinculado (Opcional)"
      f.input :description, label: "Descrição do Lançamento"
      f.input :transaction_type, as: :select, collection: [["Receita", "revenue"], ["Despesa", "expense"]], label: "Tipo"
      f.input :amount, label: "Valor (Use negativo para despesas)"
      f.input :realized_at, as: :datepicker, label: "Data do Lançamento"
    end
    f.actions
  end
end
