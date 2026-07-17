ActiveAdmin.register Message do
  actions :index, :show, :destroy

  index do
    selectable_column
    id_column
    column :chat_room_id
    column :user
    column :content
    column :created_at
    actions
  end

  filter :chat_room_id
  filter :user
  filter :created_at
end
