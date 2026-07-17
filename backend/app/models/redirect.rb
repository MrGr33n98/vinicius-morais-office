class Redirect < ApplicationRecord
  validates :source_path, presence: true, uniqueness: true
  validates :target_path, presence: true
  validates :status_code, presence: true, inclusion: { in: [301, 302] }
end
