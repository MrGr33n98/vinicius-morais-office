class Matter < ApplicationRecord
  has_paper_trail
  belongs_to :client
  belongs_to :firm
  has_many :matter_phase_transitions, dependent: :destroy
  has_many :matter_events, dependent: :destroy
  has_many :matter_internal_notes, dependent: :destroy
  has_many :matter_client_updates, dependent: :destroy
  has_many :tasks, dependent: :destroy
  has_many :documents, dependent: :destroy
  has_many :publications, dependent: :destroy
  has_many :transactions, dependent: :destroy

  scope :stagnant, -> {
    left_joins(:matter_client_updates)
      .group("matters.id")
      .having("MAX(matter_client_updates.created_at) < ? OR COUNT(matter_client_updates.id) = 0", 120.days.ago)
  }

  validates :title, presence: true
  validates :status, presence: true, inclusion: { in: ['Active', 'Suspended', 'Closed', 'Archived'] }
  validates :current_phase, presence: true, inclusion: { in: ['peticao_inicial', 'contestacao', 'instrucao', 'sentenca', 'recurso', 'execucao'] }
  validates :code, presence: true, uniqueness: { scope: :firm_id }
  validates :court_number, presence: true, uniqueness: true, format: { with: /\A\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}\z/, message: "deve seguir o padrão CNJ (0000000-00.0000.0.00.0000)" }
end
