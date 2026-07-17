class SeoMetadatum < ApplicationRecord
  belongs_to :seoable, polymorphic: true

  validates :title, presence: true, length: { maximum: 70 }
  validates :description, presence: true, length: { maximum: 160 }
end
