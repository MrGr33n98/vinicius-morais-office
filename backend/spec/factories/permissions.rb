FactoryBot.define do
  factory :permission do
    name { Faker::Lorem.unique.word }
    description { "Descricao da permissao" }
  end
end
