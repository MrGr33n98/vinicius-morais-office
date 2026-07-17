require 'rails_helper'

RSpec.describe Meeting, type: :model do
  describe 'associations' do
    it { should belong_to(:firm) }
    it { should belong_to(:client) }
    it { should belong_to(:user) }
  end

  describe 'validations' do
    it { should validate_presence_of(:title) }
    it { should validate_presence_of(:starts_at) }
    it { should validate_presence_of(:ends_at) }
  end
end
