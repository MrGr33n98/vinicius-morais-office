ActiveAdmin.register Banner do
  menu parent: "CMS", label: "Banners", priority: 1

  permit_params :title, :message, :cta_label, :cta_url, :placement, :status, :priority, :starts_at, :ends_at

  scope :all, default: true
  scope("Ativos") { |scope| scope.published.currently_visible }
  scope("Rascunhos") { |scope| scope.where(status: "draft") }
  scope("Arquivados") { |scope| scope.where(status: "archived") }

  index do
    selectable_column
    id_column
    column :title
    column :placement
    column :status do |banner|
      status_tag banner.status, class: banner.active_now? ? :ok : :warning
    end
    column :priority
    column :cta_label
    column :cta_url
    column :starts_at
    column :ends_at
    column :updated_at
    actions
  end

  filter :title
  filter :message
  filter :placement, as: :select, collection: Banner::PLACEMENTS
  filter :status, as: :select, collection: Banner::STATUSES
  filter :priority
  filter :starts_at
  filter :ends_at

  show do
    attributes_table do
      row :title
      row :message
      row :cta_label
      row :cta_url
      row :placement
      row :status
      row :priority
      row :starts_at
      row :ends_at
      row :created_at
      row :updated_at
    end

    active_admin_comments
  end

  form do |f|
    f.inputs "Conteúdo do banner" do
      f.input :title, label: "Título interno"
      f.input :message, label: "Texto exibido", input_html: { rows: 3 }
      f.input :cta_label, label: "Texto do CTA", hint: "Ex.: Solicitar análise"
      f.input :cta_url, label: "URL do CTA", hint: "Pode ser #form, /portal/login ou uma URL completa."
    end

    f.inputs "Publicação" do
      f.input :placement, as: :select, collection: Banner::PLACEMENTS, include_blank: false
      f.input :status, as: :select, collection: Banner::STATUSES, include_blank: false
      f.input :priority, hint: "Banners com prioridade maior aparecem primeiro."
      f.input :starts_at, as: :datetime_select
      f.input :ends_at, as: :datetime_select
    end

    f.actions
  end
end
