FactoryBot.define do
  factory :matter_phase_transition do
    association :matter
    from_phase { "peticao_inicial" }
    to_phase { "contestacao" }
    association :transitioned_by, factory: :user
    notes { "Transicao de fase para contestacao" }
  end
end
