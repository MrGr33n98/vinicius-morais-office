class CreateDatajudIntegrationTables < ActiveRecord::Migration[8.0]
  def change
    create_table :firm_api_keys do |t|
      t.references :firm, null: false, foreign_key: true
      t.string :key, null: false
      t.boolean :active, null: false, default: true

      t.timestamps
    end

    add_index :firm_api_keys, [:firm_id, :active]

    create_table :process_data do |t|
      t.references :matter, null: false, foreign_key: true
      t.references :firm, null: false, foreign_key: true
      t.string :datajud_id, null: false
      t.jsonb :raw_json, null: false, default: {}
      t.datetime :last_synced_at
      t.string :status, null: false, default: "pending"

      t.timestamps
    end

    add_index :process_data, :datajud_id, unique: true
    add_index :process_data, [:firm_id, :matter_id]

    create_table :process_movements do |t|
      t.references :matter, null: false, foreign_key: true
      t.references :firm, null: false, foreign_key: true
      t.string :source_movement_id, null: false
      t.string :nome
      t.datetime :data_hora
      t.jsonb :complementos_json, null: false, default: []
      t.jsonb :raw_json, null: false, default: {}
      t.text :simplified_text
      t.boolean :translated, null: false, default: false

      t.timestamps
    end

    add_index :process_movements,
      [:firm_id, :matter_id, :source_movement_id],
      unique: true,
      name: "idx_process_movements_unique_source"
    add_index :process_movements, [:matter_id, :data_hora]

    create_table :process_parties do |t|
      t.references :matter, null: false, foreign_key: true
      t.references :firm, null: false, foreign_key: true
      t.string :participation_type
      t.string :name_masked
      t.string :document_masked

      t.timestamps
    end

    add_index :process_parties, [:firm_id, :matter_id]

    create_table :process_sync_runs do |t|
      t.references :firm, null: false, foreign_key: true
      t.references :matter, null: false, foreign_key: true
      t.string :status, null: false
      t.datetime :started_at, null: false
      t.datetime :finished_at
      t.integer :movements_count, null: false, default: 0
      t.text :error_message

      t.timestamps
    end

    add_index :process_sync_runs, [:firm_id, :matter_id, :started_at]

    create_table :process_movement_translations do |t|
      t.references :process_movement, null: false, foreign_key: true
      t.text :plain_text, null: false
      t.string :prompt_version, null: false
      t.string :model, null: false

      t.timestamps
    end

    add_index :process_movement_translations,
      [:process_movement_id, :prompt_version, :model],
      name: "idx_process_movement_translations_cache"
  end
end
