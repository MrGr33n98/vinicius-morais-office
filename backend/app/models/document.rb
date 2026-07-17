class Document < ApplicationRecord
  has_paper_trail
  belongs_to :firm
  belongs_to :matter
  belongs_to :user

  has_one_attached :file
  has_many :document_versions, dependent: :destroy

  validates :title, presence: true
end
