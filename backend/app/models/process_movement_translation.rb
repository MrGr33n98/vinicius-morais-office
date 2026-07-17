class ProcessMovementTranslation < ApplicationRecord
  belongs_to :process_movement

  validates :plain_text, :prompt_version, :model, presence: true
end
