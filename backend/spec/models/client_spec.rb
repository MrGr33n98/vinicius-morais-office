require 'rails_helper'

RSpec.describe Client, type: :model do
  describe 'associations' do
    it { should belong_to(:firm) }
    it { should have_many(:accounts).dependent(:destroy) }
  end

  describe 'validations' do
    it { should validate_presence_of(:name) }
    it { should validate_presence_of(:client_type) }
    it { should validate_inclusion_of(:client_type).in_array(['Individual', 'Enterprise']) }
    it { should validate_presence_of(:document_number) }

    describe 'uniqueness' do
      let!(:firm) { create(:firm) }
      let!(:existing_client) { create(:client, firm: firm, document_number: '12345678900') }

      it 'validates uniqueness of document_number scoped to firm_id' do
        new_client = build(:client, firm: firm, document_number: '12345678900')
        expect(new_client).not_to be_valid
      end

      it 'allows same document_number in different firms' do
        other_firm = create(:firm)
        other_client = build(:client, firm: other_firm, document_number: '12345678900')
        expect(other_client).to be_valid
      end
    end
  end
end
