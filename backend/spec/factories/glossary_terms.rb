FactoryBot.define do
  factory :glossary_term do
    term { Faker::Lorem.unique.word.capitalize }
    slug { nil }
    definition { Faker::Lorem.paragraph }
  end
end
