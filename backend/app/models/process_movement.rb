class ProcessMovement < ApplicationRecord
  belongs_to :matter
  belongs_to :firm

  has_many :process_movement_translations, dependent: :destroy

  validates :source_movement_id, presence: true, uniqueness: { scope: [:firm_id, :matter_id] }

  scope :chronological, -> { order(data_hora: :desc, created_at: :desc) }
end
