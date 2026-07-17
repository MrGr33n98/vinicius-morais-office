class CreateDocumentVersions < ActiveRecord::Migration[8.0]
  def change
    create_table :document_versions do |t|
      t.references :document, null: false, foreign_key: true
      t.integer :version_number
      t.string :description
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end
