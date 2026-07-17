FactoryBot.define do
  factory :document_version do
    association :document
    association :user
    version_number { 1 }
    description { "Versão inicial" }
  end
end
