require 'rails_helper'

RSpec.describe Message, type: :model do
  describe 'associations' do
    it { should belong_to(:firm) }
    it { should belong_to(:user) }
  end

  describe 'validations' do
    it { should validate_presence_of(:chat_room_id) }
    it { should validate_presence_of(:content) }
  end
end
