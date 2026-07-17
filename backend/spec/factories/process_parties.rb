FactoryBot.define do
  factory :process_party do
    association :matter
    firm { matter.firm }
    participation_type { "AUTOR" }
    name_masked { "CLIENTE PORTAL VM" }
    document_masked { "***.***.***-**" }
  end
end
