class Area < ApplicationRecord
  has_many :services, dependent: :destroy
  has_one :seo_metadatum, as: :seoable, dependent: :destroy
  has_many :faq_items, as: :faqable, dependent: :destroy

  validates :name, presence: true
  validates :slug, presence: true, uniqueness: true

  before_validation :generate_slug

  private

  def generate_slug
    self.slug = name.parameterize if name.present? && slug.blank?
  end
end
