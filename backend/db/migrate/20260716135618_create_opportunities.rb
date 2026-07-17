class CreateOpportunities < ActiveRecord::Migration[8.0]
  def change
    create_table :opportunities do |t|
      t.string :name
      t.string :email
      t.string :phone
      t.string :stage
      t.string :source
      t.decimal :value_estimate
      t.references :client, null: false, foreign_key: true
      t.references :firm, null: false, foreign_key: true

      t.timestamps
    end
  end
end
