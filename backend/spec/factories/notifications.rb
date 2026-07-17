FactoryBot.define do
  factory :notification do
    association :user
    title { Faker::Lorem.sentence }
    content { Faker::Lorem.paragraph }
    read_at { nil }
    association :notifiable, factory: :task
  end
end
