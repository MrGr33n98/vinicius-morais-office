FactoryBot.define do
  factory :author do
    name { Faker::Name.name }
    bio { Faker::Lorem.paragraph }
    oab_number { "MT" + Faker::Number.number(digits: 5).to_s }
  end
end
