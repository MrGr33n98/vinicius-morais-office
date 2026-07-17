class Account < ApplicationRecord
  belongs_to :client
  has_many :account_memberships, dependent: :destroy
  has_many :users, through: :account_memberships

  validates :name, presence: true
  validates :status, presence: true, inclusion: { in: ['Active', 'Inactive', 'Suspended'] }
end
