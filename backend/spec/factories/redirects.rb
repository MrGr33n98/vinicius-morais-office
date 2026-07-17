FactoryBot.define do
  factory :redirect do
    source_path { "/" + Faker::Internet.unique.slug }
    target_path { "/" + Faker::Internet.slug }
    status_code { [301, 302].sample }
  end
end
