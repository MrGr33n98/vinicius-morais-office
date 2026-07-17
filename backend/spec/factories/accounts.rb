FactoryBot.define do
  factory :account do
    association :client
    name { Faker::Company.name + " Billing Account" }
    status { ["Active", "Inactive", "Suspended"].sample }
  end
end
