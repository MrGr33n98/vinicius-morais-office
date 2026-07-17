class DocumentTemplate < ApplicationRecord
  belongs_to :firm

  validates :title, presence: true
  validates :body_html, presence: true
end
