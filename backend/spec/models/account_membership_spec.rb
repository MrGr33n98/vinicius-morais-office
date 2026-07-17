require 'rails_helper'

RSpec.describe AccountMembership, type: :model do
  describe 'associations' do
    it { should belong_to(:account) }
    it { should belong_to(:user) }
  end

  describe 'validations' do
    it { should validate_presence_of(:role) }
    it { should validate_inclusion_of(:role).in_array(['client_owner', 'client_member', 'client_readonly']) }

    describe 'uniqueness' do
      let!(:user) { create(:user) }
      let!(:account) { create(:account) }
      let!(:membership) { create(:account_membership, user: user, account: account) }

      it 'validates uniqueness of user_id scoped to account_id' do
        duplicate_membership = build(:account_membership, user: user, account: account)
        expect(duplicate_membership).not_to be_valid
      end
    end
  end
end
