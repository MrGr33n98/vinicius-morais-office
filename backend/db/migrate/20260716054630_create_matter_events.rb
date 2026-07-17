class CreateMatterEvents < ActiveRecord::Migration[8.0]
  def change
    create_table :matter_events do |t|
      t.references :matter, null: false, foreign_key: true
      t.string :event_type
      t.text :description
      t.datetime :happened_at
      t.json :metadata

      t.timestamps
    end
  end
end
