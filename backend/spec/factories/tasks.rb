FactoryBot.define do
  factory :task do
    association :firm
    association :matter
    association :assignee, factory: :user
    title { Faker::Lorem.sentence }
    description { Faker::Lorem.paragraph }
    due_date { Time.current + 2.days }
    status { ["Pending", "In Progress", "Completed", "Overdue"].sample }
  end
end
