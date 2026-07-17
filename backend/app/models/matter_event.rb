class MatterEvent < ApplicationRecord
  belongs_to :matter

  validates :event_type, presence: true
  validates :description, presence: true
  validates :happened_at, presence: true
end
