class GlossaryTerm < ApplicationRecord
  has_one :seo_metadatum, as: :seoable, dependent: :destroy

  validates :term, presence: true
  validates :slug, presence: true, uniqueness: true
  validates :definition, presence: true

  before_validation :generate_slug

  private

  def generate_slug
    self.slug = term.parameterize if term.present? && slug.blank?
  end
end
