require 'rails_helper'

RSpec.describe Document, type: :model do
  describe 'associations' do
    it { should belong_to(:firm) }
    it { should belong_to(:matter) }
    it { should belong_to(:user) }
    it 'has one attached file' do
      expect(subject.file).to be_an_instance_of(ActiveStorage::Attached::One)
    end
  end

  describe 'validations' do
    it { should validate_presence_of(:title) }
  end
end
