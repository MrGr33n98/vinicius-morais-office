require 'rails_helper'

RSpec.describe Task, type: :model do
  describe 'associations' do
    it { should belong_to(:firm) }
    it { should belong_to(:matter) }
    it { should belong_to(:assignee).class_name('User') }
  end

  describe 'validations' do
    it { should validate_presence_of(:title) }
    it { should validate_presence_of(:status) }
    it { should validate_inclusion_of(:status).in_array(['Pending', 'In Progress', 'Completed', 'Overdue']) }
    it { should validate_presence_of(:due_date) }
  end
end
