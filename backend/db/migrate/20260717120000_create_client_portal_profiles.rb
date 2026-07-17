class CreateClientPortalProfiles < ActiveRecord::Migration[8.0]
  def change
    create_table :client_portal_profiles do |t|
      t.references :user, null: false, foreign_key: true, index: { unique: true }
      t.references :client, null: false, foreign_key: true
      t.string :phone
      t.string :secondary_phone
      t.string :document_number
      t.string :profession
      t.string :preferred_contact_method, null: false, default: "whatsapp"
      t.string :address_zip_code
      t.string :address_street
      t.string :address_number
      t.string :address_complement
      t.string :address_neighborhood
      t.string :address_city
      t.string :address_state
      t.boolean :email_notifications, null: false, default: true
      t.boolean :whatsapp_notifications, null: false, default: true
      t.boolean :sms_notifications, null: false, default: false
      t.boolean :marketing_consent, null: false, default: false

      t.timestamps
    end
  end
end
