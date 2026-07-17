FactoryBot.define do
  factory :matter_internal_note do
    association :matter
    association :user
    content { Faker::Lorem.paragraph }
  end
end
