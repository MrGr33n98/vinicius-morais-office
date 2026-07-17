FactoryBot.define do
  factory :message do
    association :firm
    association :user
    chat_room_id { "room_#{Faker::Number.number(digits: 5)}" }
    content { Faker::Lorem.paragraph }
  end
end
