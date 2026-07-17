FactoryBot.define do
  factory :firm_api_key do
    association :firm
    key { "datajud-test-key" }
    active { true }
  end
end
