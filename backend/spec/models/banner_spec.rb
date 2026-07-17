require 'rails_helper'

RSpec.describe Banner, type: :model do
  it 'requires a CTA URL when a CTA label is present' do
    banner = build(:banner, cta_label: "Solicitar análise", cta_url: nil)

    expect(banner).not_to be_valid
  end

  it 'knows whether it is active in the current display window' do
    banner = build(:banner, status: "active", starts_at: 1.day.ago, ends_at: 1.day.from_now)

    expect(banner.active_now?).to be(true)
  end

  it 'does not expose expired banners as currently visible' do
    create(:banner, status: "active", ends_at: 1.day.ago)

    expect(Banner.currently_visible).to be_empty
  end
end
