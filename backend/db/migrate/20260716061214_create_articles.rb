class CreateArticles < ActiveRecord::Migration[8.0]
  def change
    create_table :articles do |t|
      t.references :author, null: false, foreign_key: true
      t.string :title
      t.string :slug
      t.text :content
      t.string :status
      t.datetime :published_at

      t.timestamps
    end
    add_index :articles, :slug, unique: true
  end
end
