FactoryBot.define do
  factory :publication do
    association :matter
    journal_name { "Diário de Justiça Eletrônico do Estado de Mato Grosso" }
    content { "Fica intimada a parte autora..." }
    published_at { Date.today }
  end
end
