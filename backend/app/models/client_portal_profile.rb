class ClientPortalProfile < ApplicationRecord
  CONTACT_METHODS = %w[whatsapp email phone].freeze

  belongs_to :user
  belongs_to :client

  validates :preferred_contact_method, presence: true, inclusion: { in: CONTACT_METHODS }
  validates :address_state, length: { is: 2 }, allow_blank: true
end
