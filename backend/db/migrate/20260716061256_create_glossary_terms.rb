class CreateGlossaryTerms < ActiveRecord::Migration[8.0]
  def change
    create_table :glossary_terms do |t|
      t.string :term
      t.string :slug
      t.text :definition

      t.timestamps
    end
    add_index :glossary_terms, :slug, unique: true
  end
end
