FactoryBot.define do
  factory :client_portal_profile do
    association :user
    association :client
    phone { "(65) 99999-0000" }
    secondary_phone { "(65) 98888-0000" }
    document_number { Faker::IdNumber.brazilian_citizen_number }
    profession { "Empresário" }
    preferred_contact_method { "whatsapp" }
    address_zip_code { "78065-000" }
    address_street { "Av. Historiador Rubens de Mendonça" }
    address_number { "1858" }
    address_complement { "Sala 1007" }
    address_neighborhood { "Santa Rosa" }
    address_city { "Cuiabá" }
    address_state { "MT" }
    email_notifications { true }
    whatsapp_notifications { true }
    sms_notifications { false }
    marketing_consent { false }
  end
end
