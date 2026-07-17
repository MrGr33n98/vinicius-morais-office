class Contract < ApplicationRecord
  belongs_to :client

  validates :title, presence: true
  validates :status, presence: true, inclusion: { in: %w[draft under_review signed expired] }
end
