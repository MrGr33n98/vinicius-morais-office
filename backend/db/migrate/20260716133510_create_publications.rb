class CreatePublications < ActiveRecord::Migration[8.0]
  def change
    create_table :publications do |t|
      t.references :matter, null: false, foreign_key: true
      t.string :journal_name
      t.text :content
      t.date :published_at

      t.timestamps
    end
  end
end
