require 'rails_helper'

RSpec.describe 'CMS API Endpoints', type: :request do
  let(:author) { create(:author, name: "Dr. Roberto") }
  let!(:published_article) { create(:article, author: author, title: "Artigo Publicado", status: 'published') }
  let!(:draft_article) { create(:article, author: author, title: "Artigo Rascunho", status: 'draft') }
  
  let!(:term_b) { create(:glossary_term, term: "Bem de Família") }
  let!(:term_a) { create(:glossary_term, term: "Adjudicação") }
  let!(:topbar_banner) { create(:banner, title: "Banner principal", message: "Agenda aberta para análises iniciais.", priority: 20) }
  let!(:draft_banner) { create(:banner, title: "Banner rascunho", status: "draft") }
  let!(:expired_banner) { create(:banner, title: "Banner expirado", ends_at: 1.day.ago) }

  describe 'GET /api/v1/articles' do
    it 'returns list of published articles only' do
      get '/api/v1/articles'
      expect(response).to have_http_status(:ok)
      
      json = JSON.parse(response.body)
      expect(json.size).to eq(1)
      expect(json.first['title']).to eq("Artigo Publicado")
      expect(json.first['author']['name']).to eq("Dr. Roberto")
    end
  end

  describe 'GET /api/v1/articles/:slug' do
    it 'returns article when published' do
      get "/api/v1/articles/#{published_article.slug}"
      expect(response).to have_http_status(:ok)
      
      json = JSON.parse(response.body)
      expect(json['title']).to eq("Artigo Publicado")
    end

    it 'returns 404 when draft' do
      get "/api/v1/articles/#{draft_article.slug}"
      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'GET /api/v1/glossary_terms' do
    it 'returns glossary terms in alphabetical order' do
      get '/api/v1/glossary_terms'
      expect(response).to have_http_status(:ok)
      
      json = JSON.parse(response.body)
      expect(json.size).to eq(2)
      expect(json.first['term']).to eq("Adjudicação")
      expect(json.last['term']).to eq("Bem de Família")
    end
  end

  describe 'GET /api/v1/glossary_terms/:slug' do
    it 'returns the term detail' do
      get "/api/v1/glossary_terms/#{term_a.slug}"
      expect(response).to have_http_status(:ok)
      
      json = JSON.parse(response.body)
      expect(json['term']).to eq("Adjudicação")
    end
  end

  describe 'GET /api/v1/banners' do
    it 'returns only active visible banners for the requested placement' do
      get '/api/v1/banners', params: { placement: 'topbar' }
      expect(response).to have_http_status(:ok)

      json = JSON.parse(response.body)
      expect(json.size).to eq(1)
      expect(json.first['title']).to eq("Banner principal")
      expect(json.first['message']).to eq("Agenda aberta para análises iniciais.")
      expect(json.first['cta_label']).to eq("Solicitar análise")
      expect(json.first['cta_url']).to eq("#form")
    end
  end
end
