FactoryBot.define do
  factory :matter do
    association :client
    association :firm
    title { "Acao de " + Faker::Job.field }
    code { Faker::Alphanumeric.unique.alphanumeric(number: 10).upcase }
    court_number { "#{Faker::Number.decimal_part(digits: 7)}-#{Faker::Number.decimal_part(digits: 2)}.2026.8.11.0001" }
    status { ["Active", "Suspended", "Closed", "Archived"].sample }
    current_phase { ["peticao_inicial", "contestacao", "instrucao", "sentenca", "recurso", "execucao"].sample }
  end
end
