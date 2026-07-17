require 'rails_helper'

RSpec.describe Publication, type: :model do
  it 'is valid with valid attributes' do
    publication = build(:publication)
    expect(publication).to be_valid
  end

  it 'is invalid without journal_name' do
    publication = build(:publication, journal_name: nil)
    expect(publication).not_to be_valid
  end

  it 'is invalid without content' do
    publication = build(:publication, content: nil)
    expect(publication).not_to be_valid
  end
end
