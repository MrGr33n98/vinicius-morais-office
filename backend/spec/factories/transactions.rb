FactoryBot.define do
  factory :transaction do
    association :firm
    association :matter
    amount { 1000.00 }
    transaction_type { "revenue" }
    realized_at { Date.today }
    description { "Pagamento de honorários" }
  end
end
