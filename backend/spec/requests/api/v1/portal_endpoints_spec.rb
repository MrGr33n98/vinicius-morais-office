require 'rails_helper'

RSpec.describe 'Portal API Endpoints', type: :request do
  let!(:firm) { create(:firm, name: 'Vinicius Morais Advocacia') }
  let!(:client) { create(:client, firm: firm, name: 'Cliente Persistido', document_number: '12345678000190') }
  let!(:account) { create(:account, client: client, status: 'Active') }
  let!(:user) { create(:user, firm: firm, email: 'cliente@example.com', password: 'password123', password_confirmation: 'password123') }
  let!(:membership) { create(:account_membership, account: account, user: user, role: 'client_owner') }
  let!(:profile) { create(:client_portal_profile, user: user, client: client, phone: '(65) 99999-1111') }
  let!(:matter) do
    create(
      :matter,
      firm: firm,
      client: client,
      title: 'Processo persistido no banco',
      code: 'VMTEST001',
      court_number: '1234567-89.2026.8.11.0001',
      status: 'Active',
      current_phase: 'instrucao'
    )
  end
  let!(:update) { create(:matter_client_update, matter: matter, user: user, title: 'Atualização persistida') }
  let!(:document) { create(:document, firm: firm, matter: matter, user: user, title: 'Documento persistido', description: 'Petição') }
  let!(:task) { create(:task, firm: firm, matter: matter, assignee: user, title: 'Prazo persistido', status: 'Pending') }
  let!(:transaction) { create(:transaction, firm: firm, matter: matter, amount: -250.0, transaction_type: 'expense', description: 'Despesa persistida') }
  let!(:process_datum) { create(:process_datum, matter: matter, firm: firm, datajud_id: 'dj-123') }
  let!(:movement_recent) do
    create(
      :process_movement,
      matter: matter,
      firm: firm,
      source_movement_id: 'mv-001',
      nome: 'Audiência designada',
      data_hora: 10.days.ago,
      simplified_text: 'Uma audiência foi marcada para o processo.',
      translated: true
    )
  end
  let!(:movement_old) do
    create(
      :process_movement,
      matter: matter,
      firm: firm,
      source_movement_id: 'mv-002',
      nome: 'Juntada de petição',
      data_hora: 40.days.ago,
      simplified_text: 'Uma petição foi anexada ao processo.',
      translated: true
    )
  end

  describe 'POST /api/v1/auth/login' do
    it 'authenticates a portal user and returns a bearer token' do
      post '/api/v1/auth/login', params: { email: user.email, password: 'password123' }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['token']).to be_present
      expect(json['user']['role']).to eq('client_owner')
      expect(json['user']['client_id']).to eq(client.id)
    end

    it 'rejects invalid credentials' do
      post '/api/v1/auth/login', params: { email: user.email, password: 'wrong' }

      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'GET /api/v1/portal' do
    it 'returns persisted client dashboard data' do
      get '/api/v1/portal', headers: auth_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)

      expect(json['name']).to eq('Cliente Persistido')
      expect(json['profile']['phone']).to eq('(65) 99999-1111')
      expect(json['matters'].first['title']).to eq('Processo persistido no banco')
      expect(json['matters'].first['andamentos'].first['title']).to eq('Atualização persistida')
      expect(json['matters'].first['documents'].first['name']).to eq('Documento persistido')
      expect(json['recent_prazos'].first['title']).to eq('Prazo persistido')
    end

    it 'requires authentication' do
      get '/api/v1/portal'

      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'GET /api/v1/portal_profile' do
    it 'returns the persisted portal profile' do
      get '/api/v1/portal_profile', headers: auth_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['user_name']).to eq(user.name)
      expect(json['client_name']).to eq('Cliente Persistido')
      expect(json['phone']).to eq('(65) 99999-1111')
    end
  end

  describe 'PATCH /api/v1/portal_profile' do
    it 'persists profile, user and client data' do
      patch '/api/v1/portal_profile',
            params: {
              profile: {
                user_name: 'Cliente Atualizado',
                user_email: 'cliente-atualizado@example.com',
                client_name: 'Empresa Atualizada',
                client_document_number: '99887766000155',
                phone: '(65) 98888-7777',
                profession: 'Diretor',
                preferred_contact_method: 'email',
                address_city: 'Várzea Grande',
                address_state: 'MT',
                email_notifications: false,
                whatsapp_notifications: true,
                sms_notifications: true,
                marketing_consent: true
              }
            },
            headers: auth_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['user_name']).to eq('Cliente Atualizado')
      expect(json['user_email']).to eq('cliente-atualizado@example.com')
      expect(json['client_name']).to eq('Empresa Atualizada')
      expect(json['phone']).to eq('(65) 98888-7777')
      expect(json['preferred_contact_method']).to eq('email')
      expect(json['sms_notifications']).to be(true)

      expect(user.reload.name).to eq('Cliente Atualizado')
      expect(client.reload.name).to eq('Empresa Atualizada')
      expect(profile.reload.phone).to eq('(65) 98888-7777')
    end

    it 'rejects invalid contact preferences' do
      patch '/api/v1/portal_profile',
            params: { profile: { preferred_contact_method: 'telegram' } },
            headers: auth_headers

      expect(response).to have_http_status(:unprocessable_entity)
      json = JSON.parse(response.body)
      expect(json['errors']).not_to be_empty
    end
  end

  describe 'POST /api/v1/portal_messages' do
    it 'persists a client message' do
      expect do
        post '/api/v1/portal_messages',
             params: { message: { content: 'Mensagem gravada no banco', chat_room_id: "client:#{client.id}:general" } },
             headers: auth_headers
      end.to change(Message, :count).by(1)

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json['text']).to eq('Mensagem gravada no banco')
      expect(json['mine']).to be(true)
    end
  end

  describe 'GET /api/v1/portal/matters/:id/timeline' do
    it 'returns process movements and health for the client matter' do
      get "/api/v1/portal/matters/#{matter.id}/timeline", headers: auth_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)

      expect(json['matter']['id']).to eq(matter.id)
      expect(json['movements'].size).to eq(2)
      expect(json['movements'].first['source_movement_id']).to eq('mv-001')
      expect(json['movements'].first['simplified_text']).to eq('Uma audiência foi marcada para o processo.')
      expect(json['health']['status']).to eq('green')
      expect(json['health']['days_since']).to eq(10)
    end

    it 'returns not found for a matter outside the client scope' do
      other_client = create(:client, firm: firm)
      other_matter = create(:matter, firm: firm, client: other_client)

      get "/api/v1/portal/matters/#{other_matter.id}/timeline", headers: auth_headers

      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'GET /api/v1/portal/matters/:id/health' do
    it 'returns the computed health payload' do
      get "/api/v1/portal/matters/#{matter.id}/health", headers: auth_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['status']).to eq('green')
      expect(json['days_since']).to eq(10)
      expect(json['last_movement_date']).to be_present
    end
  end

  def auth_headers
    post '/api/v1/auth/login', params: { email: user.email, password: 'password123' }
    token = JSON.parse(response.body)['token']
    { 'Authorization' => "Bearer #{token}" }
  end
end
