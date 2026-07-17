class CreateContracts < ActiveRecord::Migration[8.0]
  def change
    create_table :contracts do |t|
      t.references :client, null: false, foreign_key: true
      t.string :title
      t.string :status
      t.string :signing_url
      t.datetime :signed_at

      t.timestamps
    end
  end
end
