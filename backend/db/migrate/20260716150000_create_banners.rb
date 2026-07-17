class CreateBanners < ActiveRecord::Migration[8.0]
  def change
    create_table :banners do |t|
      t.string :title, null: false
      t.text :message, null: false
      t.string :cta_label
      t.string :cta_url
      t.string :placement, null: false, default: "topbar"
      t.string :status, null: false, default: "draft"
      t.integer :priority, null: false, default: 0
      t.datetime :starts_at
      t.datetime :ends_at

      t.timestamps
    end

    add_index :banners, :placement
    add_index :banners, :status
    add_index :banners, [:placement, :status, :priority]
  end
end
