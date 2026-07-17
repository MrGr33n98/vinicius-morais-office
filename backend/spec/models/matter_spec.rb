require 'rails_helper'

RSpec.describe Matter, type: :model do
  describe 'associations' do
    it { should belong_to(:client) }
    it { should belong_to(:firm) }
    it { should have_many(:matter_phase_transitions).dependent(:destroy) }
  end

  describe 'validations' do
    it { should validate_presence_of(:title) }
    it { should validate_presence_of(:status) }
    it { should validate_inclusion_of(:status).in_array(['Active', 'Suspended', 'Closed', 'Archived']) }
    it { should validate_presence_of(:current_phase) }
    it { should validate_inclusion_of(:current_phase).in_array(['peticao_inicial', 'contestacao', 'instrucao', 'sentenca', 'recurso', 'execucao']) }
    it { should validate_presence_of(:code) }
    it { should validate_presence_of(:court_number) }

    describe 'court_number format validation' do
      it 'is valid with CNJ format 0000999-12.2026.8.11.0001' do
        matter = build(:matter, court_number: '0000999-12.2026.8.11.0001')
        expect(matter).to be_valid
      end

      it 'is invalid with random string' do
        matter = build(:matter, court_number: '12345abc')
        expect(matter).not_to be_valid
        expect(matter.errors[:court_number]).to include('deve seguir o padrão CNJ (0000000-00.0000.0.00.0000)')
      end
    end
  end

  describe 'auditing with PaperTrail' do
    let(:matter) { create(:matter, title: 'Processo Inicial') }

    it 'creates a version when Matter is updated' do
      expect {
        matter.update!(title: 'Processo Alterado')
      }.to change { matter.versions.count }.by(1)
    end
  end
end
