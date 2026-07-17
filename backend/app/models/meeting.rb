class Meeting < ApplicationRecord
  belongs_to :firm
  belongs_to :client
  belongs_to :user

  validates :title, presence: true
  validates :starts_at, presence: true
  validates :ends_at, presence: true
end
