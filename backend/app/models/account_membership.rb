class AccountMembership < ApplicationRecord
  belongs_to :account
  belongs_to :user

  validates :role, presence: true, inclusion: { in: ['client_owner', 'client_member', 'client_readonly'] }
  validates :user_id, uniqueness: { scope: :account_id }
end
