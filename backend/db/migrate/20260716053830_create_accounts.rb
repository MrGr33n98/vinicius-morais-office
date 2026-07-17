class CreateAccounts < ActiveRecord::Migration[8.0]
  def change
    create_table :accounts do |t|
      t.references :client, null: false, foreign_key: true
      t.string :name
      t.string :status

      t.timestamps
    end
  end
end
