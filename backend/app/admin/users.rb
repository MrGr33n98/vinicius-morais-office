ActiveAdmin.register User do
  permit_params :name, :email, :password, :password_confirmation, :firm_id

  filter :name
  filter :email
  filter :firm
  filter :created_at

  index do
    selectable_column
    id_column
    column :name
    column :email
    column :firm
    column :sign_in_count
    column :current_sign_in_at
    column :created_at
    actions
  end

  form do |f|
    f.inputs "Detalhes do Usuário" do
      f.input :name
      f.input :email
      f.input :firm, as: :select, collection: Firm.all
      if f.object.new_record?
        f.input :password
        f.input :password_confirmation
      end
    end
    f.actions
  end
end
