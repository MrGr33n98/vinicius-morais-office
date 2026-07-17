FactoryBot.define do
  factory :contract do
    association :client
    title { "Contrato de Assessoria Jurídica" }
    status { "draft" }
    signing_url { "https://assinatura.advini.com.br/token-teste" }
  end
end
