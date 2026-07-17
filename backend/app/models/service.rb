class Service < ApplicationRecord
  belongs_to :area
  has_one :seo_metadatum, as: :seoable, dependent: :destroy
  has_many :faq_items, as: :faqable, dependent: :destroy

  validates :title, presence: true
  validates :slug, presence: true, uniqueness: true
  validates :content, presence: true

  before_validation :generate_slug
  after_commit :trigger_publish_job, on: [:create, :update]

  private

  def trigger_publish_job
    PublishContentJob.perform_async('Service', id)
  end

  def generate_slug
    self.slug = title.parameterize if title.present? && slug.blank?
  end
end
