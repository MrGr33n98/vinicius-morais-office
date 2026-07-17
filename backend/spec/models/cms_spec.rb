require 'rails_helper'
require 'sidekiq/testing'

RSpec.describe 'CMS Module & SEO Engine', type: :model do
  describe 'Area' do
    it 'generates a slug automatically before validation' do
      area = build(:area, name: "Direito de Família")
      expect(area.valid?).to be_truthy
      expect(area.slug).to eq("direito-de-familia")
    end

    it 'requires a unique slug' do
      create(:area, name: "Civil")
      duplicate = build(:area, name: "Civil")
      expect(duplicate.valid?).to be_falsey
    end

    it 'has dependent destroy for services and seo metadata' do
      area = create(:area, name: "Trabalhista")
      create(:service, area: area)
      create(:seo_metadatum, seoable: area)

      expect { area.destroy }.to change(Service, :count).by(-1)
        .and change(SeoMetadatum, :count).by(-1)
    end
  end

  describe 'Service' do
    it 'generates a slug automatically before validation' do
      service = build(:service, title: "Inventário e Partilha Cuiabá")
      expect(service.valid?).to be_truthy
      expect(service.slug).to eq("inventario-e-partilha-cuiaba")
    end
  end

  describe 'Article & Background Publication Callback' do
    let(:author) { create(:author) }

    it 'starts as draft with nil published_at' do
      article = create(:article, author: author, status: 'draft')
      expect(article.published_at).to be_nil
    end

    it 'sets published_at automatically when changing status to published' do
      article = create(:article, author: author, status: 'draft')
      article.update!(status: 'published')
      expect(article.published_at).not_to be_nil
    end

    it 'triggers PublishContentJob on status change to published' do
      Sidekiq::Testing.fake! do
        PublishContentJob.jobs.clear
        article = create(:article, author: author, status: 'draft')
        expect {
          article.update!(status: 'published')
        }.to change(PublishContentJob.jobs, :size).by(1)
        
        job = PublishContentJob.jobs.last
        expect(job['args']).to eq(['Article', article.id])
      end
    end
  end

  describe 'SeoMetadatum' do
    it 'validates title max length' do
      seo = build(:seo_metadatum, title: "a" * 71)
      expect(seo.valid?).to be_falsey
    end

    it 'validates description max length' do
      seo = build(:seo_metadatum, description: "b" * 161)
      expect(seo.valid?).to be_falsey
    end
  end

  describe 'Redirect' do
    it 'validates presence of paths' do
      r = build(:redirect, source_path: nil)
      expect(r.valid?).to be_falsey
    end

    it 'restricts status_code to 301 or 302' do
      r = build(:redirect, status_code: 404)
      expect(r.valid?).to be_falsey
    end
  end
end
