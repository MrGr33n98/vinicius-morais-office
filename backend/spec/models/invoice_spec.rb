require 'rails_helper'

RSpec.describe Invoice, type: :model do
  it 'is valid with valid attributes' do
    invoice = build(:invoice)
    expect(invoice).to be_valid
  end

  it 'is invalid without due_date' do
    invoice = build(:invoice, due_date: nil)
    expect(invoice).not_to be_valid
  end

  it 'is invalid with invalid status' do
    invoice = build(:invoice, status: 'expired')
    expect(invoice).not_to be_valid
  end

  it 'is invalid with invalid payment method' do
    invoice = build(:invoice, payment_method: 'cheque')
    expect(invoice).not_to be_valid
  end
end
