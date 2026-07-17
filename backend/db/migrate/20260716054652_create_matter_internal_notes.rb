class CreateMatterInternalNotes < ActiveRecord::Migration[8.0]
  def change
    create_table :matter_internal_notes do |t|
      t.references :matter, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.text :content

      t.timestamps
    end
  end
end
