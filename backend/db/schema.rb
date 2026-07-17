# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2026_07_17_120000) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "account_memberships", force: :cascade do |t|
    t.bigint "account_id", null: false
    t.bigint "user_id", null: false
    t.string "role"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_account_memberships_on_account_id"
    t.index ["user_id"], name: "index_account_memberships_on_user_id"
  end

  create_table "accounts", force: :cascade do |t|
    t.bigint "client_id", null: false
    t.string "name"
    t.string "status"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["client_id"], name: "index_accounts_on_client_id"
  end

  create_table "active_admin_comments", force: :cascade do |t|
    t.string "namespace"
    t.text "body"
    t.string "resource_type"
    t.bigint "resource_id"
    t.string "author_type"
    t.bigint "author_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["author_type", "author_id"], name: "index_active_admin_comments_on_author"
    t.index ["namespace"], name: "index_active_admin_comments_on_namespace"
    t.index ["resource_type", "resource_id"], name: "index_active_admin_comments_on_resource"
  end

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "admin_users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_admin_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_admin_users_on_reset_password_token", unique: true
  end

  create_table "areas", force: :cascade do |t|
    t.string "name"
    t.string "slug"
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["slug"], name: "index_areas_on_slug", unique: true
  end

  create_table "articles", force: :cascade do |t|
    t.bigint "author_id", null: false
    t.string "title"
    t.string "slug"
    t.text "content"
    t.string "status"
    t.datetime "published_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["author_id"], name: "index_articles_on_author_id"
    t.index ["slug"], name: "index_articles_on_slug", unique: true
  end

  create_table "authors", force: :cascade do |t|
    t.string "name"
    t.text "bio"
    t.string "oab_number"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "banners", force: :cascade do |t|
    t.string "title", null: false
    t.text "message", null: false
    t.string "cta_label"
    t.string "cta_url"
    t.string "placement", default: "topbar", null: false
    t.string "status", default: "draft", null: false
    t.integer "priority", default: 0, null: false
    t.datetime "starts_at"
    t.datetime "ends_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["placement", "status", "priority"], name: "index_banners_on_placement_and_status_and_priority"
    t.index ["placement"], name: "index_banners_on_placement"
    t.index ["status"], name: "index_banners_on_status"
  end

  create_table "client_portal_profiles", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "client_id", null: false
    t.string "phone"
    t.string "secondary_phone"
    t.string "document_number"
    t.string "profession"
    t.string "preferred_contact_method", default: "whatsapp", null: false
    t.string "address_zip_code"
    t.string "address_street"
    t.string "address_number"
    t.string "address_complement"
    t.string "address_neighborhood"
    t.string "address_city"
    t.string "address_state"
    t.boolean "email_notifications", default: true, null: false
    t.boolean "whatsapp_notifications", default: true, null: false
    t.boolean "sms_notifications", default: false, null: false
    t.boolean "marketing_consent", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["client_id"], name: "index_client_portal_profiles_on_client_id"
    t.index ["user_id"], name: "index_client_portal_profiles_on_user_id", unique: true
  end

  create_table "clients", force: :cascade do |t|
    t.bigint "firm_id", null: false
    t.string "name"
    t.string "document_number"
    t.string "client_type"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["document_number"], name: "index_clients_on_document_number", unique: true
    t.index ["firm_id"], name: "index_clients_on_firm_id"
  end

  create_table "contracts", force: :cascade do |t|
    t.bigint "client_id", null: false
    t.string "title"
    t.string "status"
    t.string "signing_url"
    t.datetime "signed_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["client_id"], name: "index_contracts_on_client_id"
  end

  create_table "document_templates", force: :cascade do |t|
    t.string "title"
    t.text "body_html"
    t.bigint "firm_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["firm_id"], name: "index_document_templates_on_firm_id"
  end

  create_table "document_versions", force: :cascade do |t|
    t.bigint "document_id", null: false
    t.integer "version_number"
    t.string "description"
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["document_id"], name: "index_document_versions_on_document_id"
    t.index ["user_id"], name: "index_document_versions_on_user_id"
  end

  create_table "documents", force: :cascade do |t|
    t.bigint "firm_id", null: false
    t.bigint "matter_id", null: false
    t.bigint "user_id", null: false
    t.string "title"
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["firm_id"], name: "index_documents_on_firm_id"
    t.index ["matter_id"], name: "index_documents_on_matter_id"
    t.index ["user_id"], name: "index_documents_on_user_id"
  end

  create_table "faq_items", force: :cascade do |t|
    t.string "question"
    t.text "answer"
    t.string "faqable_type", null: false
    t.bigint "faqable_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["faqable_type", "faqable_id"], name: "index_faq_items_on_faqable"
  end

  create_table "firms", force: :cascade do |t|
    t.string "name"
    t.string "subdomain"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["subdomain"], name: "index_firms_on_subdomain", unique: true
  end

  create_table "glossary_terms", force: :cascade do |t|
    t.string "term"
    t.string "slug"
    t.text "definition"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["slug"], name: "index_glossary_terms_on_slug", unique: true
  end

  create_table "invoices", force: :cascade do |t|
    t.bigint "client_id", null: false
    t.decimal "amount"
    t.date "due_date"
    t.string "status"
    t.string "payment_method"
    t.string "barcode"
    t.text "pix_code"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["client_id"], name: "index_invoices_on_client_id"
  end

  create_table "leads", force: :cascade do |t|
    t.string "name"
    t.string "email"
    t.string "phone"
    t.string "status"
    t.text "notes"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "matter_client_updates", force: :cascade do |t|
    t.bigint "matter_id", null: false
    t.bigint "user_id", null: false
    t.string "title"
    t.text "content"
    t.datetime "published_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["matter_id"], name: "index_matter_client_updates_on_matter_id"
    t.index ["user_id"], name: "index_matter_client_updates_on_user_id"
  end

  create_table "matter_events", force: :cascade do |t|
    t.bigint "matter_id", null: false
    t.string "event_type"
    t.text "description"
    t.datetime "happened_at"
    t.json "metadata"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["matter_id"], name: "index_matter_events_on_matter_id"
  end

  create_table "matter_internal_notes", force: :cascade do |t|
    t.bigint "matter_id", null: false
    t.bigint "user_id", null: false
    t.text "content"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["matter_id"], name: "index_matter_internal_notes_on_matter_id"
    t.index ["user_id"], name: "index_matter_internal_notes_on_user_id"
  end

  create_table "matter_phase_transitions", force: :cascade do |t|
    t.bigint "matter_id", null: false
    t.string "from_phase"
    t.string "to_phase"
    t.string "transitioned_by_type", null: false
    t.bigint "transitioned_by_id", null: false
    t.text "notes"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["matter_id"], name: "index_matter_phase_transitions_on_matter_id"
    t.index ["transitioned_by_type", "transitioned_by_id"], name: "index_matter_phase_transitions_on_transitioned_by"
  end

  create_table "matters", force: :cascade do |t|
    t.bigint "client_id", null: false
    t.bigint "firm_id", null: false
    t.string "title"
    t.string "code"
    t.string "court_number"
    t.string "status"
    t.string "current_phase"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "folder"
    t.string "court_name"
    t.string "action_class"
    t.index ["client_id"], name: "index_matters_on_client_id"
    t.index ["code"], name: "index_matters_on_code", unique: true
    t.index ["court_number"], name: "index_matters_on_court_number", unique: true
    t.index ["firm_id"], name: "index_matters_on_firm_id"
  end

  create_table "meetings", force: :cascade do |t|
    t.bigint "firm_id", null: false
    t.bigint "client_id", null: false
    t.bigint "user_id", null: false
    t.string "title"
    t.text "description"
    t.datetime "starts_at"
    t.datetime "ends_at"
    t.string "meeting_url"
    t.string "calendly_event_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["client_id"], name: "index_meetings_on_client_id"
    t.index ["firm_id"], name: "index_meetings_on_firm_id"
    t.index ["user_id"], name: "index_meetings_on_user_id"
  end

  create_table "messages", force: :cascade do |t|
    t.bigint "firm_id", null: false
    t.bigint "user_id", null: false
    t.string "chat_room_id"
    t.text "content"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["firm_id"], name: "index_messages_on_firm_id"
    t.index ["user_id"], name: "index_messages_on_user_id"
  end

  create_table "notifications", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "title"
    t.text "content"
    t.datetime "read_at"
    t.string "notifiable_type", null: false
    t.bigint "notifiable_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["notifiable_type", "notifiable_id"], name: "index_notifications_on_notifiable"
    t.index ["user_id"], name: "index_notifications_on_user_id"
  end

  create_table "opportunities", force: :cascade do |t|
    t.string "name"
    t.string "email"
    t.string "phone"
    t.string "stage"
    t.string "source"
    t.decimal "value_estimate"
    t.bigint "client_id"
    t.bigint "firm_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["client_id"], name: "index_opportunities_on_client_id"
    t.index ["firm_id"], name: "index_opportunities_on_firm_id"
  end

  create_table "permissions", force: :cascade do |t|
    t.string "name"
    t.string "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "publications", force: :cascade do |t|
    t.bigint "matter_id", null: false
    t.string "journal_name"
    t.text "content"
    t.date "published_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["matter_id"], name: "index_publications_on_matter_id"
  end

  create_table "redirects", force: :cascade do |t|
    t.string "source_path"
    t.string "target_path"
    t.integer "status_code"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["source_path"], name: "index_redirects_on_source_path", unique: true
  end

  create_table "role_permissions", force: :cascade do |t|
    t.bigint "role_id", null: false
    t.bigint "permission_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["permission_id"], name: "index_role_permissions_on_permission_id"
    t.index ["role_id"], name: "index_role_permissions_on_role_id"
  end

  create_table "roles", force: :cascade do |t|
    t.string "name"
    t.string "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "seo_metadata", force: :cascade do |t|
    t.string "seoable_type", null: false
    t.bigint "seoable_id", null: false
    t.string "title"
    t.string "description"
    t.string "canonical_url"
    t.json "schema_json"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["seoable_type", "seoable_id"], name: "index_seo_metadata_on_seoable"
  end

  create_table "services", force: :cascade do |t|
    t.bigint "area_id", null: false
    t.string "title"
    t.string "slug"
    t.text "content"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["area_id"], name: "index_services_on_area_id"
    t.index ["slug"], name: "index_services_on_slug", unique: true
  end

  create_table "subscriptions", force: :cascade do |t|
    t.bigint "client_id", null: false
    t.string "plan_name"
    t.decimal "amount"
    t.string "status"
    t.date "next_billing_date"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["client_id"], name: "index_subscriptions_on_client_id"
  end

  create_table "tasks", force: :cascade do |t|
    t.bigint "firm_id", null: false
    t.bigint "matter_id", null: false
    t.bigint "assignee_id", null: false
    t.string "title"
    t.text "description"
    t.datetime "due_date"
    t.string "status"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["assignee_id"], name: "index_tasks_on_assignee_id"
    t.index ["firm_id"], name: "index_tasks_on_firm_id"
    t.index ["matter_id"], name: "index_tasks_on_matter_id"
  end

  create_table "transactions", force: :cascade do |t|
    t.decimal "amount"
    t.string "transaction_type"
    t.date "realized_at"
    t.string "description"
    t.bigint "matter_id", null: false
    t.bigint "firm_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["firm_id"], name: "index_transactions_on_firm_id"
    t.index ["matter_id"], name: "index_transactions_on_matter_id"
  end

  create_table "user_roles", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "role_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["role_id"], name: "index_user_roles_on_role_id"
    t.index ["user_id"], name: "index_user_roles_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.bigint "firm_id"
    t.string "name", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string "current_sign_in_ip"
    t.string "last_sign_in_ip"
    t.integer "failed_attempts", default: 0, null: false
    t.string "unlock_token"
    t.datetime "locked_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["firm_id"], name: "index_users_on_firm_id"
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["unlock_token"], name: "index_users_on_unlock_token", unique: true
  end

  create_table "versions", force: :cascade do |t|
    t.string "whodunnit"
    t.datetime "created_at"
    t.bigint "item_id", null: false
    t.string "item_type", null: false
    t.string "event", null: false
    t.text "object"
    t.index ["item_type", "item_id"], name: "index_versions_on_item_type_and_item_id"
  end

  add_foreign_key "account_memberships", "accounts"
  add_foreign_key "account_memberships", "users"
  add_foreign_key "accounts", "clients"
  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "articles", "authors"
  add_foreign_key "client_portal_profiles", "clients"
  add_foreign_key "client_portal_profiles", "users"
  add_foreign_key "clients", "firms"
  add_foreign_key "contracts", "clients"
  add_foreign_key "document_templates", "firms"
  add_foreign_key "document_versions", "documents"
  add_foreign_key "document_versions", "users"
  add_foreign_key "documents", "firms"
  add_foreign_key "documents", "matters"
  add_foreign_key "documents", "users"
  add_foreign_key "invoices", "clients"
  add_foreign_key "matter_client_updates", "matters"
  add_foreign_key "matter_client_updates", "users"
  add_foreign_key "matter_events", "matters"
  add_foreign_key "matter_internal_notes", "matters"
  add_foreign_key "matter_internal_notes", "users"
  add_foreign_key "matter_phase_transitions", "matters"
  add_foreign_key "matters", "clients"
  add_foreign_key "matters", "firms"
  add_foreign_key "meetings", "clients"
  add_foreign_key "meetings", "firms"
  add_foreign_key "meetings", "users"
  add_foreign_key "messages", "firms"
  add_foreign_key "messages", "users"
  add_foreign_key "notifications", "users"
  add_foreign_key "opportunities", "clients"
  add_foreign_key "opportunities", "firms"
  add_foreign_key "publications", "matters"
  add_foreign_key "role_permissions", "permissions"
  add_foreign_key "role_permissions", "roles"
  add_foreign_key "services", "areas"
  add_foreign_key "subscriptions", "clients"
  add_foreign_key "tasks", "firms"
  add_foreign_key "tasks", "matters"
  add_foreign_key "tasks", "users", column: "assignee_id"
  add_foreign_key "transactions", "firms"
  add_foreign_key "transactions", "matters"
  add_foreign_key "user_roles", "roles"
  add_foreign_key "user_roles", "users"
  add_foreign_key "users", "firms"
end
