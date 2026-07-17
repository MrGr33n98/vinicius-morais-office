class Opportunity < ApplicationRecord
  belongs_to :firm
  belongs_to :client, optional: true

  validates :name, presence: true
  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :phone, presence: true
  validates :stage, presence: true, inclusion: { in: %w[lead meeting proposal won lost] }
  validates :source, presence: true, inclusion: { in: %w[ads organico indicacao] }
  validates :value_estimate, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
end
