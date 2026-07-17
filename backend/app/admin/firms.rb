ActiveAdmin.register Firm do
  permit_params :name, :subdomain

  index do
    selectable_column
    id_column
    column :name
    column :subdomain
    column :created_at
    actions
  end

  filter :name
  filter :subdomain
  filter :created_at

  form do |f|
    f.inputs do
      f.input :name
      f.input :subdomain
    end
    f.actions
  end
end
