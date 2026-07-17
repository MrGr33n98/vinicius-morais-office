FactoryBot.define do
  factory :account_membership do
    association :account
    association :user
    role { ["client_owner", "client_member", "client_readonly"].sample }
  end
end
