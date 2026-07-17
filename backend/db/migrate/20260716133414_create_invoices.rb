class CreateInvoices < ActiveRecord::Migration[8.0]
  def change
    create_table :invoices do |t|
      t.references :client, null: false, foreign_key: true
      t.decimal :amount
      t.date :due_date
      t.string :status
      t.string :payment_method
      t.string :barcode
      t.text :pix_code

      t.timestamps
    end
  end
end
