FactoryBot.define do
  factory :seo_metadatum do
    association :seoable, factory: :area
    title { Faker::Lorem.sentence(word_count: 4).truncate(70) }
    description { Faker::Lorem.sentence(word_count: 10).truncate(160) }
    canonical_url { Faker::Internet.url }
    schema_json { { "@context" => "https://schema.org", "@type" => "WebPage" } }
  end
end
