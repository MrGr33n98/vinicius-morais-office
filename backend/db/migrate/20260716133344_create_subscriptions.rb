class CreateSubscriptions < ActiveRecord::Migration[8.0]
  def change
    create_table :subscriptions do |t|
      t.references :client, null: false, foreign_key: true
      t.string :plan_name
      t.decimal :amount
      t.string :status
      t.date :next_billing_date

      t.timestamps
    end
  end
end
