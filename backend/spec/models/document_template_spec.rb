require 'rails_helper'

RSpec.describe DocumentTemplate, type: :model do
  it 'is valid with valid attributes' do
    template = build(:document_template)
    expect(template).to be_valid
  end

  it 'is invalid without title' do
    template = build(:document_template, title: nil)
    expect(template).not_to be_valid
  end

  it 'is invalid without body_html' do
    template = build(:document_template, body_html: nil)
    expect(template).not_to be_valid
  end
end
