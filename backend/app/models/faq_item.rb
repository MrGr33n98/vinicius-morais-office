class FaqItem < ApplicationRecord
  belongs_to :faqable, polymorphic: true

  validates :question, presence: true
  validates :answer, presence: true
end
