class MatterPhaseTransition < ApplicationRecord
  belongs_to :matter
  belongs_to :transitioned_by, polymorphic: true

  validates :from_phase, presence: true
  validates :to_phase, presence: true
end
