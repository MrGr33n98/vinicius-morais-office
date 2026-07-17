FactoryBot.define do
  factory :faq_item do
    question { Faker::Lorem.sentence(word_count: 6) + "?" }
    answer { Faker::Lorem.paragraph }
    association :faqable, factory: :area
  end
end
