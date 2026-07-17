FactoryBot.define do
  factory :document do
    association :firm
    association :matter
    association :user
    title { Faker::File.file_name(dir: 'docs', ext: 'pdf') }
    description { Faker::Lorem.sentence }
  end
end
