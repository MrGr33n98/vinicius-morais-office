class FirmApiKey < ApplicationRecord
  belongs_to :firm

  encrypts :key

  scope :active, -> { where(active: true) }

  validates :key, presence: true
  validate :single_active_key_per_firm

  before_validation :deactivate_other_active_keys, if: :activating_key?

  def masked_key
    return "" if key.blank?

    visible = key.last(6)
    "#{'*' * [key.length - 6, 0].max}#{visible}"
  end

  private

  def activating_key?
    active? && (new_record? || will_save_change_to_active? || will_save_change_to_key?)
  end

  def deactivate_other_active_keys
    firm.firm_api_keys.where.not(id: id).active.update_all(active: false, updated_at: Time.current)
  end

  def single_active_key_per_firm
    return unless active?

    relation = firm&.firm_api_keys&.active
    relation = relation.where.not(id: id) if persisted?
    return unless relation&.exists?

    errors.add(:active, "já possui outra chave ativa para esta firma")
  end
end
