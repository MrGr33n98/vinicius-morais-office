require 'rails_helper'

RSpec.describe DocumentVersion, type: :model do
  it 'is valid with valid attributes' do
    document_version = build(:document_version)
    expect(document_version).to be_valid
  end

  it 'is invalid without version_number' do
    document_version = build(:document_version, version_number: nil)
    expect(document_version).not_to be_valid
  end

  it 'is invalid with negative version_number' do
    document_version = build(:document_version, version_number: 0)
    expect(document_version).not_to be_valid
  end

  it 'is invalid without description' do
    document_version = build(:document_version, description: nil)
    expect(document_version).not_to be_valid
  end
end
