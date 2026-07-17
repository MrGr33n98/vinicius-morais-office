class Task < ApplicationRecord
  belongs_to :firm
  belongs_to :matter
  belongs_to :assignee, class_name: 'User'

  validates :title, presence: true
  validates :status, presence: true, inclusion: { in: ['Pending', 'In Progress', 'Completed', 'Overdue'] }
  validates :due_date, presence: true
end
