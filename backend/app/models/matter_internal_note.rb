class MatterInternalNote < ApplicationRecord
  belongs_to :matter
  belongs_to :user

  validates :content, presence: true
end
