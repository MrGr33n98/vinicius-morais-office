class ProcessSyncRun < ApplicationRecord
  STATUSES = %w[running success failed not_found missing_api_key].freeze

  belongs_to :firm
  belongs_to :matter

  validates :status, presence: true, inclusion: { in: STATUSES }
  validates :started_at, presence: true
end
