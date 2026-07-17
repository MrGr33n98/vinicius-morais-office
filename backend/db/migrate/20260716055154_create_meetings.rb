class CreateMeetings < ActiveRecord::Migration[8.0]
  def change
    create_table :meetings do |t|
      t.references :firm, null: false, foreign_key: true
      t.references :client, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.string :title
      t.text :description
      t.datetime :starts_at
      t.datetime :ends_at
      t.string :meeting_url
      t.string :calendly_event_id

      t.timestamps
    end
  end
end
