require 'rails_helper'

RSpec.describe Opportunity, type: :model do
  it 'is valid with valid attributes' do
    opp = build(:opportunity)
    expect(opp).to be_valid
  end

  it 'is invalid without a name' do
    opp = build(:opportunity, name: nil)
    expect(opp).not_to be_valid
  end

  it 'is invalid with bad email format' do
    opp = build(:opportunity, email: 'invalido')
    expect(opp).not_to be_valid
  end

  it 'is invalid with incorrect stage' do
    opp = build(:opportunity, stage: 'negotiation')
    expect(opp).not_to be_valid
  end
end
