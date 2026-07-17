class Banner < ApplicationRecord
  PLACEMENTS = %w[topbar].freeze
  STATUSES = %w[draft active archived].freeze

  validates :title, presence: true
  validates :message, presence: true
  validates :placement, presence: true, inclusion: { in: PLACEMENTS }
  validates :status, presence: true, inclusion: { in: STATUSES }
  validates :priority, numericality: { only_integer: true }
  validates :cta_url, presence: true, if: -> { cta_label.present? }

  scope :published, -> { where(status: "active") }
  scope :for_placement, ->(placement) { where(placement: placement.presence || "topbar") }
  scope :currently_visible, -> {
    now = Time.current
    where("starts_at IS NULL OR starts_at <= ?", now)
      .where("ends_at IS NULL OR ends_at >= ?", now)
  }
  scope :ordered_for_display, -> { order(priority: :desc, created_at: :desc) }

  def active_now?
    status == "active" &&
      (starts_at.blank? || starts_at <= Time.current) &&
      (ends_at.blank? || ends_at >= Time.current)
  end
end
