class CreateSeoMetadata < ActiveRecord::Migration[8.0]
  def change
    create_table :seo_metadata do |t|
      t.references :seoable, polymorphic: true, null: false
      t.string :title
      t.string :description
      t.string :canonical_url
      t.json :schema_json

      t.timestamps
    end
  end
end
