require 'rails_helper'

RSpec.describe MatterClientUpdate, type: :model do
  describe 'associations' do
    it { should belong_to(:matter) }
    it { should belong_to(:user) }
  end

  describe 'validations' do
    it { should validate_presence_of(:title) }
    it { should validate_presence_of(:content) }
    it { should validate_presence_of(:published_at) }
  end
end
