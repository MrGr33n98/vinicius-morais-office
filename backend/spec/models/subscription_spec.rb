require 'rails_helper'

RSpec.describe Subscription, type: :model do
  it 'is valid with valid attributes' do
    subscription = build(:subscription)
    expect(subscription).to be_valid
  end

  it 'is invalid without a plan name' do
    subscription = build(:subscription, plan_name: nil)
    expect(subscription).not_to be_valid
  end

  it 'is invalid with negative amount' do
    subscription = build(:subscription, amount: -100)
    expect(subscription).not_to be_valid
  end

  it 'is invalid with invalid status' do
    subscription = build(:subscription, status: 'invalid')
    expect(subscription).not_to be_valid
  end
end
