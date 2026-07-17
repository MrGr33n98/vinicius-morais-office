FactoryBot.define do
  factory :role do
    name { Faker::Job.unique.title }
    description { "Descricao do papel" }
  end
end
