ActiveAdmin.register Account do
  permit_params :client_id, :name, :status

  index do
    selectable_column
    id_column
    column :name
    column :client
    column :status
    actions
  end

  filter :name
  filter :client
  filter :status, as: :select, collection: ['Active', 'Inactive', 'Suspended']

  form do |f|
    f.inputs do
      f.input :client
      f.input :name
      f.input :status, as: :select, collection: ['Active', 'Inactive', 'Suspended']
    end
    f.actions
  end
end
