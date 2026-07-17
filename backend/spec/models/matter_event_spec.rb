require 'rails_helper'

RSpec.describe MatterEvent, type: :model do
  describe 'associations' do
    it { should belong_to(:matter) }
  end

  describe 'validations' do
    it { should validate_presence_of(:event_type) }
    it { should validate_presence_of(:description) }
    it { should validate_presence_of(:happened_at) }
  end
end
