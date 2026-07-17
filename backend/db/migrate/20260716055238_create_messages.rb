class CreateMessages < ActiveRecord::Migration[8.0]
  def change
    create_table :messages do |t|
      t.references :firm, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.string :chat_room_id
      t.text :content

      t.timestamps
    end
  end
end
