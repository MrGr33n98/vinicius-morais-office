FactoryBot.define do
  factory :matter_event do
    association :matter
    event_type { "distribuicao" }
    description { "Distribuicao automatica do processo no tribunal" }
    happened_at { Time.current }
    metadata { { cnj_class: "Procedimento Comum Civel" } }
  end
end
