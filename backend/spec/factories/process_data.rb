FactoryBot.define do
  factory :process_datum do
    association :matter
    firm { matter.firm }
    datajud_id { SecureRandom.hex(8) }
    raw_json { { id: datajud_id, numeroProcesso: matter.court_number } }
    last_synced_at { Time.current }
    status { "synced" }
  end
end
