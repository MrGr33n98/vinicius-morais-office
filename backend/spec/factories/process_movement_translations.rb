FactoryBot.define do
  factory :process_movement_translation do
    association :process_movement
    plain_text { "O andamento foi traduzido para linguagem simples." }
    prompt_version { "datajud-movement-plain-pt-br-v1" }
    model { "gpt-4o-mini" }
  end
end
