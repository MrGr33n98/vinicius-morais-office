require 'rails_helper'

RSpec.describe Contract, type: :model do
  it 'is valid with valid attributes' do
    contract = build(:contract)
    expect(contract).to be_valid
  end

  it 'is invalid without title' do
    contract = build(:contract, title: nil)
    expect(contract).not_to be_valid
  end

  it 'is invalid with invalid status' do
    contract = build(:contract, status: 'rejected')
    expect(contract).not_to be_valid
  end
end
