class ProcessDatum < ApplicationRecord
  self.table_name = "process_data"

  STATUSES = %w[pending synced failed not_found].freeze

  belongs_to :matter
  belongs_to :firm

  validates :datajud_id, presence: true, uniqueness: true
  validates :status, presence: true, inclusion: { in: STATUSES }
end
