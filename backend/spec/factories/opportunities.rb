FactoryBot.define do
  factory :opportunity do
    association :firm
    name { "Gabriel Silva" }
    email { "gabriel@example.com" }
    phone { "6599998888" }
    stage { "lead" }
    source { "ads" }
    value_estimate { 5000.00 }
  end
end
