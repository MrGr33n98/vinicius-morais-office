require 'rails_helper'

RSpec.describe 'CRM and Finance API Endpoints', type: :request do
  let!(:firm) { create(:firm, name: "Vinicius Morais Advocacia") }
  let!(:client) { create(:client, firm: firm) }
  let!(:matter) { create(:matter, client: client, firm: firm, current_phase: "sentenca") }
  
  let!(:revenue_t) { create(:transaction, firm: firm, matter: matter, amount: 2500.0, transaction_type: "revenue", description: "Entrada de Honorários") }
  let!(:expense_t) { create(:transaction, firm: firm, matter: matter, amount: -150.0, transaction_type: "expense", description: "Cópia de Processo") }

  describe 'POST /api/v1/opportunities' do
    it 'creates a new opportunity lead from Landing Page' do
      post '/api/v1/opportunities', params: {
        opportunity: {
          name: "Luan Silveira",
          email: "luan@example.com",
          phone: "65999998888",
          source: "ads",
          value_estimate: 5000.00
        }
      }
      
      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json['success']).to be true
      expect(json['data']['name']).to eq("Luan Silveira")
      expect(json['data']['stage']).to eq("lead")
    end

    it 'fails when parameter is missing' do
      post '/api/v1/opportunities', params: {
        opportunity: {
          name: nil,
          email: "invalido",
          phone: nil,
          source: "redes_sociais"
        }
      }

      expect(response).to have_http_status(:unprocessable_entity)
      json = JSON.parse(response.body)
      expect(json['success']).to be false
      expect(json['errors']).not_to be_empty
    end
  end

  describe 'GET /api/v1/matters/:matter_id/transactions' do
    it 'returns all transactions of a matter' do
      get "/api/v1/matters/#{matter.id}/transactions"
      expect(response).to have_http_status(:ok)
      
      json = JSON.parse(response.body)
      expect(json.size).to eq(2)
      expect(json.first['description']).to eq("Entrada de Honorários")
      expect(json.last['description']).to eq("Cópia de Processo")
    end

    it 'returns 404 for invalid matter id' do
      get "/api/v1/matters/99999/transactions"
      expect(response).to have_http_status(:not_found)
    end
  end
end
