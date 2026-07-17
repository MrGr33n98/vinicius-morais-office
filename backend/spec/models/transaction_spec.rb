require 'rails_helper'

RSpec.describe Transaction, type: :model do
  it 'is valid with valid attributes' do
    t = build(:transaction)
    expect(t).to be_valid
  end

  it 'is invalid with zero amount' do
    t = build(:transaction, amount: 0)
    expect(t).not_to be_valid
  end

  it 'is invalid with incorrect transaction_type' do
    t = build(:transaction, transaction_type: 'transfer')
    expect(t).not_to be_valid
  end

  it 'is invalid without description' do
    t = build(:transaction, description: nil)
    expect(t).not_to be_valid
  end
end
