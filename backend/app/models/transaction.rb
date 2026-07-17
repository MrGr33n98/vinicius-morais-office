class Transaction < ApplicationRecord
  belongs_to :firm
  belongs_to :matter, optional: true

  validates :amount, presence: true, numericality: { other_than: 0 }
  validates :transaction_type, presence: true, inclusion: { in: %w[revenue expense] }
  validates :realized_at, presence: true
  validates :description, presence: true
end
