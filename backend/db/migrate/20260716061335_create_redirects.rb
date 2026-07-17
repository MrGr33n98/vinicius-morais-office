class CreateRedirects < ActiveRecord::Migration[8.0]
  def change
    create_table :redirects do |t|
      t.string :source_path
      t.string :target_path
      t.integer :status_code

      t.timestamps
    end
    add_index :redirects, :source_path, unique: true
  end
end
