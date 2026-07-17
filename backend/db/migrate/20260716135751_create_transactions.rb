class CreateTransactions < ActiveRecord::Migration[8.0]
  def change
    create_table :transactions do |t|
      t.decimal :amount
      t.string :transaction_type
      t.date :realized_at
      t.string :description
      t.references :matter, null: false, foreign_key: true
      t.references :firm, null: false, foreign_key: true

      t.timestamps
    end
  end
end
