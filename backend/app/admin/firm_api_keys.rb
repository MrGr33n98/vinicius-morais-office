ActiveAdmin.register FirmApiKey do
  permit_params :firm_id, :key, :active

  menu parent: "Configurações", label: "Chaves DataJud", priority: 1

  scope :all, default: true
  scope("Ativas") { |keys| keys.active }

  index do
    selectable_column
    id_column
    column :firm
    column("Chave mascarada") { |record| record.masked_key }
    column("Status") { |record| status_tag(record.active? ? "ativa" : "inativa", class: record.active? ? "ok" : "warning") }
    column :created_at
    column :updated_at
    actions
  end

  filter :firm
  filter :active
  filter :created_at

  show do
    attributes_table do
      row :firm
      row("Chave mascarada") { |record| record.masked_key }
      row("Ativa") { |record| status_tag(record.active? ? "sim" : "não") }
      row :created_at
      row :updated_at
    end
  end

  form do |f|
    f.inputs "Credencial DataJud" do
      if current_user.has_role?(:super_admin)
        f.input :firm, as: :select, collection: Firm.order(:name)
      else
        f.object.firm ||= current_user.firm
        para f.object.firm.name, label: "Firma"
      end

      f.input :key, input_html: { autocomplete: "off" }, hint: "Cole a chave pública obtida via gov.br."
      f.input :active, hint: "Ao ativar esta chave, as demais chaves ativas da mesma firma serão desativadas."
    end
    f.actions
  end

  controller do
    def scoped_collection
      super.includes(:firm)
    end

    def build_new_resource
      resource = super
      resource.firm ||= current_user.firm unless current_user.has_role?(:super_admin)
      resource
    end

    def create
      if current_user.has_role?(:firm_admin)
        params[:firm_api_key][:firm_id] = current_user.firm_id
      end

      super
    end

    def update
      if current_user.has_role?(:firm_admin)
        params[:firm_api_key][:firm_id] = resource.firm_id
      end

      super
    end
  end
end
