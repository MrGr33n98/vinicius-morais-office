class FirmApiKey < ApplicationRecord
  belongs_to :firm

  encrypts :key

  validates :key, presence: true
end
