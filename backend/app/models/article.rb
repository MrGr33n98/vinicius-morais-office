class Article < ApplicationRecord
  belongs_to :author
  has_one :seo_metadatum, as: :seoable, dependent: :destroy
  has_many :faq_items, as: :faqable, dependent: :destroy

  validates :title, presence: true
  validates :slug, presence: true, uniqueness: true
  validates :content, presence: true
  validates :status, presence: true, inclusion: { in: ['draft', 'under_review', 'published'] }

  before_validation :generate_slug
  before_save :set_published_at
  after_commit :trigger_publish_job, on: [:create, :update], if: :saved_change_to_status?

  private

  def trigger_publish_job
    if status == 'published'
      PublishContentJob.perform_async('Article', id)
    end
  end

  def generate_slug
    self.slug = title.parameterize if title.present? && slug.blank?
  end

  def set_published_at
    if status == 'published' && published_at.blank?
      self.published_at = Time.current
    end
  end
end
