class DocumentVersion < ApplicationRecord
  belongs_to :document
  belongs_to :user

  validates :version_number, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 1 }
  validates :description, presence: true
end
