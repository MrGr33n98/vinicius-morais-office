class CreateFirms < ActiveRecord::Migration[8.0]
  def change
    create_table :firms do |t|
      t.string :name
      t.string :subdomain

      t.timestamps
    end
    add_index :firms, :subdomain, unique: true
  end
end
