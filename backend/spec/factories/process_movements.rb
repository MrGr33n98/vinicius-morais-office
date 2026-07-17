FactoryBot.define do
  factory :process_movement do
    association :matter
    firm { matter.firm }
    sequence(:source_movement_id) { |n| "mv-#{n}" }
    nome { "Conclusos para decisão" }
    data_hora { Time.current }
    complementos_json { [] }
    raw_json { { id: source_movement_id, nome: nome, dataHora: data_hora.iso8601 } }
    simplified_text { "O processo foi encaminhado para decisão." }
    translated { true }
  end
end
