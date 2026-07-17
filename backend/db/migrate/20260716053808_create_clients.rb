class CreateClients < ActiveRecord::Migration[8.0]
  def change
    create_table :clients do |t|
      t.references :firm, null: false, foreign_key: true
      t.string :name
      t.string :document_number
      t.string :client_type

      t.timestamps
    end
    add_index :clients, :document_number, unique: true
  end
end
