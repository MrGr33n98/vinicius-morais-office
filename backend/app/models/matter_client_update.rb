class MatterClientUpdate < ApplicationRecord
  belongs_to :matter
  belongs_to :user

  validates :title, presence: true
  validates :content, presence: true
  validates :published_at, presence: true
end
