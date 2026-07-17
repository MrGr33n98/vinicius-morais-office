class CreateAuthors < ActiveRecord::Migration[8.0]
  def change
    create_table :authors do |t|
      t.string :name
      t.text :bio
      t.string :oab_number

      t.timestamps
    end
  end
end
