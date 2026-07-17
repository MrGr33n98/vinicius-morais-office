FactoryBot.define do
  factory :matter_client_update do
    association :matter
    association :user
    title { Faker::Lorem.sentence }
    content { Faker::Lorem.paragraph }
    published_at { Time.current }
  end
end
