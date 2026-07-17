require 'rails_helper'

RSpec.describe Account, type: :model do
  describe 'associations' do
    it { should belong_to(:client) }
    it { should have_many(:account_memberships).dependent(:destroy) }
    it { should have_many(:users).through(:account_memberships) }
  end

  describe 'validations' do
    it { should validate_presence_of(:name) }
    it { should validate_presence_of(:status) }
    it { should validate_inclusion_of(:status).in_array(['Active', 'Inactive', 'Suspended']) }
  end
end
