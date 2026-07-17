ActiveAdmin.register Meeting do
  permit_params :firm_id, :client_id, :user_id, :title, :description, :starts_at, :ends_at, :meeting_url, :calendly_event_id

  index do
    selectable_column
    id_column
    column :title
    column :client
    column :user
    column :starts_at
    column :ends_at
    actions
  end

  filter :title
  filter :client
  filter :user
  filter :starts_at

  form do |f|
    f.inputs do
      f.input :firm, as: :select, collection: Firm.all if current_user.has_role?(:super_admin)
      f.input :client
      f.input :user
      f.input :title
      f.input :description
      f.input :starts_at, as: :datetime_picker
      f.input :ends_at, as: :datetime_picker
      f.input :meeting_url
      f.input :calendly_event_id
    end
    f.actions
  end
end
