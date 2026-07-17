class CreateDocumentTemplates < ActiveRecord::Migration[8.0]
  def change
    create_table :document_templates do |t|
      t.string :title
      t.text :body_html
      t.references :firm, null: false, foreign_key: true

      t.timestamps
    end
  end
end
