class AddDetailFieldsToMatters < ActiveRecord::Migration[8.0]
  def change
    add_column :matters, :folder, :string
    add_column :matters, :court_name, :string
    add_column :matters, :action_class, :string
  end
end
