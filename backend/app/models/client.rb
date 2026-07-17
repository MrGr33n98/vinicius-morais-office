class Client < ApplicationRecord
  has_paper_trail
  belongs_to :firm
  has_many :accounts, dependent: :destroy
  has_many :matters, dependent: :destroy
  has_one :subscription, dependent: :destroy
  has_many :invoices, dependent: :destroy
  has_many :contracts, dependent: :destroy
  has_many :meetings, dependent: :destroy
  has_many :client_portal_profiles, dependent: :destroy

  validates :name, presence: true
  validates :client_type, presence: true, inclusion: { in: ['Individual', 'Enterprise'] }
  validates :document_number, presence: true, uniqueness: { scope: :firm_id }
end
