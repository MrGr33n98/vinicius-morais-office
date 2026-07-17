class CreateMatters < ActiveRecord::Migration[8.0]
  def change
    create_table :matters do |t|
      t.references :client, null: false, foreign_key: true
      t.references :firm, null: false, foreign_key: true
      t.string :title
      t.string :code
      t.string :court_number
      t.string :status
      t.string :current_phase

      t.timestamps
    end
    add_index :matters, :code, unique: true
    add_index :matters, :court_number, unique: true
  end
end
