class Author < ApplicationRecord
  has_many :articles, dependent: :destroy
  has_one_attached :avatar

  validates :name, presence: true
  validates :oab_number, presence: true
end
