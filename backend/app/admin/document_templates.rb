ActiveAdmin.register DocumentTemplate do
  menu parent: "Modelos & Documentos", label: "Modelos de Petição/Contratos", priority: 1
  permit_params :title, :body_html, :firm_id

  index do
    selectable_column
    id_column
    column "Título do Modelo", :title
    column "Criado Em", :created_at
    column "Escritório", :firm
    actions
  end

  filter :title, label: "Título do Modelo"
  filter :firm

  form do |f|
    f.inputs "Detalhes do Template" do
      f.input :firm, label: "Escritório"
      f.input :title, label: "Título do Modelo de Documento"
      f.input :body_html, as: :text, label: "Estrutura do Documento (HTML / Liquid Tags)", input_html: { rows: 15 }
    end
    f.actions
  end
end
