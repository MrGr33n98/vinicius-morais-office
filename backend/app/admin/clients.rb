ActiveAdmin.register Client do
  permit_params :firm_id, :name, :document_number, :client_type

  index do
    selectable_column
    id_column
    column :name
    column :document_number
    column :client_type
    column :firm
    actions
  end

  filter :name
  filter :document_number
  filter :client_type, as: :select, collection: ['Individual', 'Enterprise']
  filter :firm

  form do |f|
    f.inputs do
      f.input :firm, as: :select, collection: Firm.all if current_user.has_role?(:super_admin)
      f.input :name
      f.input :document_number
      f.input :client_type, as: :select, collection: ['Individual', 'Enterprise']
    end
    f.actions
  end
end
