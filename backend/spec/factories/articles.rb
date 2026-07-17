FactoryBot.define do
  factory :article do
    association :author
    title { Faker::Lorem.unique.sentence(word_count: 5) }
    slug { nil }
    content { Faker::Lorem.paragraph(sentence_count: 5) }
    status { "draft" }
    published_at { nil }
  end
end
