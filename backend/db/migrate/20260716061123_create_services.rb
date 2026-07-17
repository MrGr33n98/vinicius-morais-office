class CreateServices < ActiveRecord::Migration[8.0]
  def change
    create_table :services do |t|
      t.references :area, null: false, foreign_key: true
      t.string :title
      t.string :slug
      t.text :content

      t.timestamps
    end
    add_index :services, :slug, unique: true
  end
end
