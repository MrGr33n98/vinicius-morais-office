class Publication < ApplicationRecord
  belongs_to :matter

  validates :journal_name, presence: true
  validates :content, presence: true
  validates :published_at, presence: true
end
