FactoryBot.define do
  factory :document_template do
    association :firm
    title { "Modelo de Procuração Geral" }
    body_html { "<p>Outorgante: {{client.name}}</p>" }
  end
end
