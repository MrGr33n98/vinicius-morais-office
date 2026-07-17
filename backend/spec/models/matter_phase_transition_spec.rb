require 'rails_helper'

RSpec.describe MatterPhaseTransition, type: :model do
  describe 'associations' do
    it { should belong_to(:matter) }
    it { should belong_to(:transitioned_by) }
  end

  describe 'validations' do
    it { should validate_presence_of(:from_phase) }
    it { should validate_presence_of(:to_phase) }
  end
end
