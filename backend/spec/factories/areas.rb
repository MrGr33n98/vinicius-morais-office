FactoryBot.define do
  factory :area do
    name { Faker::Job.unique.field + " Law" }
    slug { nil }
    description { Faker::Lorem.paragraph }
  end
end
