FactoryBot.define do
  factory :service do
    association :area
    title { "Advogado de " + Faker::Job.unique.field }
    slug { nil }
    content { Faker::Lorem.paragraph }
  end
end
