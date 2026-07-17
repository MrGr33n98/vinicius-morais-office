class CreateMatterClientUpdates < ActiveRecord::Migration[8.0]
  def change
    create_table :matter_client_updates do |t|
      t.references :matter, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.string :title
      t.text :content
      t.datetime :published_at

      t.timestamps
    end
  end
end
