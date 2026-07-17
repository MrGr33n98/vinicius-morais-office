ActiveAdmin.register Notification do
  actions :index, :show, :destroy

  index do
    selectable_column
    id_column
    column :user
    column :title
    column :content
    column :read_at
    column :notifiable_type
    actions
  end

  filter :user
  filter :title
  filter :read_at
end
