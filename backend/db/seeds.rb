# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end
# Criação do escritório de advocacia padrão
firm = Firm.find_or_create_by!(subdomain: 'advini') do |f|
  f.name = 'Vinicius Morais Advocacia'
end

# Criação do usuário administrador unificado associado à firma
User.find_or_create_by!(email: 'admin@viniciusmorais.adv.br') do |u|
  u.name = 'Dr. Vinicius Morais'
  u.password = 'password'
  u.password_confirmation = 'password'
  u.firm = firm
end

# Garantir papéis básicos do RBAC no sistema
['super_admin', 'firm_admin', 'lawyer', 'paralegal', 'client_owner'].each do |role_name|
  Role.find_or_create_by!(name: role_name)
end

client = Client.find_or_create_by!(firm: firm, document_number: '12.345.678/0001-90') do |c|
  c.name = 'Cliente Portal VM'
  c.client_type = 'Enterprise'
end

account = Account.find_or_create_by!(client: client, name: 'Conta Portal Cliente') do |a|
  a.status = 'Active'
end

portal_user = User.find_or_create_by!(email: 'cliente@viniciusmorais.adv.br') do |u|
  u.name = 'Cliente Portal VM'
  u.password = 'password'
  u.password_confirmation = 'password'
  u.firm = firm
end

AccountMembership.find_or_create_by!(account: account, user: portal_user) do |membership|
  membership.role = 'client_owner'
end

ClientPortalProfile.find_or_create_by!(user: portal_user) do |profile|
  profile.client = client
  profile.phone = '(65) 99909-8888'
  profile.secondary_phone = '(65) 99900-0000'
  profile.document_number = '123.456.789-00'
  profile.profession = 'Empresário'
  profile.preferred_contact_method = 'whatsapp'
  profile.address_zip_code = '78065-000'
  profile.address_street = 'Av. Historiador Rubens de Mendonça'
  profile.address_number = '1858'
  profile.address_complement = 'Sala 1007'
  profile.address_neighborhood = 'Santa Rosa'
  profile.address_city = 'Cuiabá'
  profile.address_state = 'MT'
  profile.email_notifications = true
  profile.whatsapp_notifications = true
  profile.sms_notifications = false
  profile.marketing_consent = false
end

matter = Matter.find_or_create_by!(firm: firm, code: 'VM-2026-0043') do |m|
  m.client = client
  m.title = 'Ação de Cobrança Indevida - Restabelecimento de Crédito'
  m.court_number = '0801234-56.2026.8.11.0041'
  m.status = 'Active'
  m.current_phase = 'instrucao'
  m.folder = 'Pasta Digital #122'
  m.court_name = '1º Juizado Especial Cível de Cuiabá - Foro Central'
  m.action_class = 'Procedimento do Juizado Especial Cível'
end

MatterPhaseTransition.find_or_create_by!(
  matter: matter,
  from_phase: 'contestacao',
  to_phase: 'instrucao',
  transitioned_by: portal_user
) do |transition|
  transition.notes = 'Processo avançou para fase de instrução.'
end

MatterClientUpdate.find_or_create_by!(matter: matter, user: portal_user, title: 'Audiência de instrução realizada') do |update|
  update.content = 'Audiência realizada conforme designado. A equipe acompanha os próximos atos do processo.'
  update.published_at = 6.days.ago
end

MatterClientUpdate.find_or_create_by!(matter: matter, user: portal_user, title: 'Juntada de manifestação') do |update|
  update.content = 'Manifestação protocolada e disponibilizada para acompanhamento no portal.'
  update.published_at = 12.days.ago
end

MatterEvent.find_or_create_by!(matter: matter, event_type: 'Movimentação processual', description: 'Contestação apresentada pela parte contrária.') do |event|
  event.happened_at = 18.days.ago
end

Task.find_or_create_by!(firm: firm, matter: matter, assignee: portal_user, title: 'Manifestação sobre documentos') do |task|
  task.description = 'Prazo interno para revisar documentos recebidos.'
  task.due_date = 5.days.from_now
  task.status = 'Pending'
end

Document.find_or_create_by!(firm: firm, matter: matter, user: portal_user, title: 'Petição de Impugnação à Contestação') do |document|
  document.description = 'Petição'
end

Document.find_or_create_by!(firm: firm, matter: matter, user: portal_user, title: 'Comprovante de Pagamento de Custas') do |document|
  document.description = 'Comprovantes'
end

Transaction.find_or_create_by!(firm: firm, matter: matter, description: 'Honorários advocatícios - Parcela 1') do |transaction|
  transaction.amount = -2500.0
  transaction.transaction_type = 'expense'
  transaction.realized_at = 10.days.ago.to_date
end

Transaction.find_or_create_by!(firm: firm, matter: matter, description: 'Depósito judicial') do |transaction|
  transaction.amount = 2800.0
  transaction.transaction_type = 'revenue'
  transaction.realized_at = 3.days.ago.to_date
end

Message.find_or_create_by!(firm: firm, user: portal_user, chat_room_id: "client:#{client.id}:general", content: 'Olá, este é o canal oficial de atendimento do seu portal.') 
