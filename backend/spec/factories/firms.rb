FactoryBot.define do
  factory :firm do
    name { Faker::Company.name }
    subdomain { Faker::Internet.unique.domain_word }
  end
end
