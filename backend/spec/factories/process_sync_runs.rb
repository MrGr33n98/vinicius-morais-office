FactoryBot.define do
  factory :process_sync_run do
    association :firm
    association :matter
    status { "success" }
    started_at { 5.minutes.ago }
    finished_at { 1.minute.ago }
    movements_count { 3 }
    error_message { nil }
  end
end
