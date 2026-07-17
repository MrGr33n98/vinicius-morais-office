FactoryBot.define do
  factory :client do
    association :firm
    name { Faker::Name.name }
    document_number { Faker::IdNumber.brazilian_citizen_number }
    client_type { ["Individual", "Enterprise"].sample }
  end
end
