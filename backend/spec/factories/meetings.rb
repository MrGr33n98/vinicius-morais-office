FactoryBot.define do
  factory :meeting do
    association :firm
    association :client
    association :user
    title { Faker::Lorem.sentence }
    description { Faker::Lorem.paragraph }
    starts_at { Time.current + 1.hour }
    ends_at { Time.current + 2.hours }
    meeting_url { Faker::Internet.url }
    calendly_event_id { Faker::Alphanumeric.alphanumeric(number: 20) }
  end
end
