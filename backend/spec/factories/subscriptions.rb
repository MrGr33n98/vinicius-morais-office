FactoryBot.define do
  factory :subscription do
    association :client
    plan_name { "Plano Elite" }
    amount { 1500.00 }
    status { "active" }
    next_billing_date { Date.today + 30.days }
  end
end
