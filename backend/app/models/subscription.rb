class Subscription < ApplicationRecord
  belongs_to :client

  validates :plan_name, presence: true
  validates :amount, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :status, presence: true, inclusion: { in: %w[active suspended canceled] }
end
