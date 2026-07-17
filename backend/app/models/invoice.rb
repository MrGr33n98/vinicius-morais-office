class Invoice < ApplicationRecord
  belongs_to :client

  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :due_date, presence: true
  validates :status, presence: true, inclusion: { in: %w[pending paid overdue] }
  validates :payment_method, presence: true, inclusion: { in: %w[boleto pix credit_card] }
end
