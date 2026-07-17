require 'rails_helper'

RSpec.describe 'Backoffice Policies Security Shield', type: :model do
  let(:firm) { create(:firm) }
  let(:other_firm) { create(:firm) }
  let(:client) { create(:client, firm: firm) }
  let(:matter) { create(:matter, firm: firm, client: client) }

  # Perfis internos
  let(:super_admin) { create(:user, firm: nil) }
  let(:firm_admin) { create(:user, firm: firm) }
  let(:lawyer) { create(:user, firm: firm) }
  let(:paralegal) { create(:user, firm: firm) }

  # Perfis de cliente
  let(:client_owner) { create(:user, firm: firm) }
  let(:client_member) { create(:user, firm: firm) }

  before do
    super_admin.roles << create(:role, name: 'super_admin')
    firm_admin.roles << create(:role, name: 'firm_admin')
    lawyer.roles << create(:role, name: 'lawyer')
    paralegal.roles << create(:role, name: 'paralegal')
    client_owner.roles << create(:role, name: 'client_owner')
    client_member.roles << create(:role, name: 'client_member')
  end

  describe 'FirmPolicy' do
    it 'allows super_admin full access' do
      policy = FirmPolicy.new(super_admin, firm)
      expect(policy.index?).to be_truthy
      expect(policy.show?).to be_truthy
      expect(policy.create?).to be_truthy
      expect(policy.update?).to be_truthy
      expect(policy.destroy?).to be_truthy
    end

    it 'allows firm_admin only read and update of their own firm' do
      policy = FirmPolicy.new(firm_admin, firm)
      expect(policy.index?).to be_truthy
      expect(policy.show?).to be_truthy
      expect(policy.create?).to be_falsey
      expect(policy.update?).to be_truthy
      expect(policy.destroy?).to be_falsey

      policy_other = FirmPolicy.new(firm_admin, other_firm)
      expect(policy_other.show?).to be_falsey
      expect(policy_other.update?).to be_falsey
    end

    it 'denies lawyers and paralegals control over Firm' do
      expect(FirmPolicy.new(lawyer, firm).index?).to be_falsey
      expect(FirmPolicy.new(paralegal, firm).index?).to be_falsey
    end
  end

  describe 'ClientPolicy' do
    it 'allows firm_admin, lawyers and paralegals to create clients' do
      expect(ClientPolicy.new(firm_admin, client).create?).to be_truthy
      expect(ClientPolicy.new(lawyer, client).create?).to be_truthy
      expect(ClientPolicy.new(paralegal, client).create?).to be_truthy
    end
  end

  describe 'MatterEventPolicy (LGPD Shield)' do
    let(:event) { create(:matter_event, matter: matter) }

    it 'allows internal staff to view and manage events' do
      policy = MatterEventPolicy.new(lawyer, event)
      expect(policy.index?).to be_truthy
      expect(policy.show?).to be_truthy
      expect(policy.create?).to be_truthy
    end

    it 'blocks clients from seeing or managing internal raw events' do
      policy = MatterEventPolicy.new(client_owner, event)
      expect(policy.index?).to be_falsey
      expect(policy.show?).to be_falsey
      expect(policy.create?).to be_falsey
    end
  end

  describe 'MatterInternalNotePolicy (LGPD Confidentials Shield)' do
    let(:internal_note) { create(:matter_internal_note, matter: matter, user: lawyer) }

    it 'allows lawyers and admins to view and create internal notes' do
      policy = MatterInternalNotePolicy.new(lawyer, internal_note)
      expect(policy.index?).to be_truthy
      expect(policy.show?).to be_truthy
      expect(policy.create?).to be_truthy
    end

    it 'blocks clients from accessing internal strategist notes' do
      policy = MatterInternalNotePolicy.new(client_owner, internal_note)
      expect(policy.index?).to be_falsey
      expect(policy.show?).to be_falsey
      expect(policy.create?).to be_falsey
    end
  end

  describe 'MatterClientUpdatePolicy' do
    let(:client_update) { create(:matter_client_update, matter: matter, user: lawyer) }

    it 'allows both internal staff and clients to view updates' do
      expect(MatterClientUpdatePolicy.new(lawyer, client_update).show?).to be_truthy
      expect(MatterClientUpdatePolicy.new(client_owner, client_update).show?).to be_truthy
    end
  end
end
