class CreateTasks < ActiveRecord::Migration[8.0]
  def change
    create_table :tasks do |t|
      t.references :firm, null: false, foreign_key: true
      t.references :matter, null: false, foreign_key: true
      t.references :assignee, null: false, foreign_key: { to_table: :users }
      t.string :title
      t.text :description
      t.datetime :due_date
      t.string :status

      t.timestamps
    end
  end
end
