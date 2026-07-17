require 'rails_helper'

RSpec.describe User, type: :model do
  describe 'associations' do
    it { should belong_to(:firm).optional }
    it { should have_many(:user_roles).dependent(:destroy) }
    it { should have_many(:roles).through(:user_roles) }
    it { should have_many(:permissions).through(:roles) }
  end

  describe 'validations' do
    it { should validate_presence_of(:name) }
    it { should validate_presence_of(:email) }
  end

  describe 'RBAC helper methods' do
    let(:user) { create(:user) }
    let(:role) { create(:role, name: 'lawyer') }
    let(:permission) { create(:permission, name: 'view_cases') }

    before do
      role.permissions << permission
      user.roles << role
    end

    it 'returns true when checking for an associated role' do
      expect(user.has_role?(:lawyer)).to be_truthy
      expect(user.has_role?('lawyer')).to be_truthy
    end

    it 'returns false when checking for a non-associated role' do
      expect(user.has_role?(:client_owner)).to be_falsey
    end

    it 'returns true when checking for an associated permission' do
      expect(user.has_permission?(:view_cases)).to be_truthy
      expect(user.has_permission?('view_cases')).to be_truthy
    end

    it 'returns false when checking for a non-associated permission' do
      expect(user.has_permission?(:delete_firm)).to be_falsey
    end
  end
end
