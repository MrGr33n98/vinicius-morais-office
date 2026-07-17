FactoryBot.define do
  factory :invoice do
    association :client
    amount { 1500.00 }
    due_date { Date.today + 10.days }
    status { "pending" }
    payment_method { "boleto" }
    barcode { "34191.79001 01043.513184 91020.150008 7 97730000150000" }
    pix_code { "00020101021226870014br.gov.bcb.pix2565pix.advini.com" }
  end
end
