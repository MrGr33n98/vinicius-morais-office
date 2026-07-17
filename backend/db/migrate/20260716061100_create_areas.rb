class CreateAreas < ActiveRecord::Migration[8.0]
  def change
    create_table :areas do |t|
      t.string :name
      t.string :slug
      t.text :description

      t.timestamps
    end
    add_index :areas, :slug, unique: true
  end
end
