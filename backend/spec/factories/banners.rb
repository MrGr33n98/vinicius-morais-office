FactoryBot.define do
  factory :banner do
    title { "Campanha principal" }
    message { "Atendimento jurídico estratégico com acompanhamento digital do seu processo." }
    cta_label { "Solicitar análise" }
    cta_url { "#form" }
    placement { "topbar" }
    status { "active" }
    priority { 10 }
    starts_at { nil }
    ends_at { nil }
  end
end
