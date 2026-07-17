ActiveAdmin.register Task do
  permit_params :firm_id, :matter_id, :assignee_id, :title, :description, :due_date, :status

  index do
    selectable_column
    id_column
    column :title
    column :matter
    column :assignee
    column :due_date
    column :status
    actions
  end

  filter :title
  filter :matter
  filter :assignee
  filter :status, as: :select, collection: ['Pending', 'In Progress', 'Completed', 'Overdue']

  form do |f|
    f.inputs do
      f.input :firm, as: :select, collection: Firm.all if current_user.has_role?(:super_admin)
      f.input :matter
      f.input :assignee, as: :select, collection: User.all
      f.input :title
      f.input :description
      f.input :due_date, as: :datetime_picker
      f.input :status, as: :select, collection: ['Pending', 'In Progress', 'Completed', 'Overdue']
    end
    f.actions
  end
end
