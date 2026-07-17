ActiveAdmin.register Document do
  permit_params :firm_id, :matter_id, :user_id, :title, :description, :file

  index do
    selectable_column
    id_column
    column :title
    column :matter
    column :user
    column :file do |doc|
      if doc.file.attached?
        link_to "Download", rails_blob_path(doc.file, disposition: "attachment")
      else
        "Sem Arquivo"
      end
    end
    actions
  end

  filter :title
  filter :matter
  filter :user

  show do
    attributes_table do
      row :title
      row :description
      row :matter
      row :user
      row :firm
      row :file do |doc|
        link_to(doc.file.filename.to_s, url_for(doc.file)) if doc.file.attached?
      end
      row :created_at
      row :updated_at
    end
  end

  form do |f|
    f.inputs do
      f.input :firm, as: :select, collection: Firm.all if current_user.has_role?(:super_admin)
      f.input :matter
      f.input :user, as: :select, collection: User.all
      f.input :title
      f.input :description
      f.input :file, as: :file
    end
    f.actions
  end
end
