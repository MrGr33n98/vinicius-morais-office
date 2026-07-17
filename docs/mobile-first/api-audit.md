# TASK-002 — Auditoria do Backend e Contratos da API

Data: 2026-07-17  
Base auditada: Rails 8.0.5, PostgreSQL, Active Admin, Devise, Pundit/RBAC.

## Sumário Executivo

O backend já possui dados persistidos para CMS, leads, portal do cliente, perfil, mensagens, processos, documentos, tarefas, audiências e financeiro. O portal usa hoje um endpoint agregado (`GET /api/v1/portal`) que entrega praticamente toda a experiência em um único payload.

Para a experiência mobile first proposta, isso é suficiente para manter a primeira versão visual sem mock permanente, mas não é suficiente para módulos avançados como upload seguro, documentos com URLs assinadas, filtros paginados, notificações lidas, checklist de audiência, intimações separadas, Gantt/Kanban autoritativos, configurações, MFA, sessão por cookie HTTP-only e auditoria de ações críticas.

## Rotas Reais da API

Arquivo: `backend/config/routes.rb`

### Públicas

- `GET /api/v1/articles`
- `GET /api/v1/articles/:slug`
- `GET /api/v1/banners`
- `GET /api/v1/glossary_terms`
- `GET /api/v1/glossary_terms/:slug`
- `POST /api/v1/opportunities`

### Autenticação e Portal

- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `GET /api/v1/portal`
- `GET /api/v1/portal_profile`
- `PATCH /api/v1/portal_profile`
- `POST /api/v1/portal_messages`
- `GET /api/v1/matters/:matter_id/transactions`

### Active Admin

Active Admin está montado em `/admin` via `ActiveAdmin.routes(self)` e protegido por Devise/Pundit.

## Contratos da Landing Page

### Banners

Controller: `Api::V1::BannersController`

Endpoint:
- `GET /api/v1/banners?placement=topbar`

Retorno:
- `id`
- `title`
- `message`
- `cta_label`
- `cta_url`
- `placement`
- `priority`

Modelo:
- `Banner`

Status:
- Funcional.
- Gerenciável via Active Admin.
- Placements atuais limitados a `topbar`.

Gap:
- A especificação futura pode exigir banners por contexto/rota. Hoje só há `topbar`.

### Artigos

Controller: `Api::V1::ArticlesController`

Endpoints:
- `GET /api/v1/articles`
- `GET /api/v1/articles/:slug`

Retorno inclui:
- artigo publicado
- autor com `name`, `bio`, `oab_number`

Modelo:
- `Article`
- `Author`
- `FaqItem`
- `SeoMetadatum`

Status:
- Funcional para blog básico.

Gaps:
- Não há paginação.
- Não há categorias/tags.
- Não há resumo/tempo de leitura explícito.
- Não há payload dedicado para metadata/schema.

### Glossário

Controller: `Api::V1::GlossaryTermsController`

Endpoints:
- `GET /api/v1/glossary_terms`
- `GET /api/v1/glossary_terms/:slug`

Status:
- Funcional.

Gap:
- Não aparece como peça central nas folhas, mas pode apoiar SEO/AEO.

### Oportunidades / Leads

Controller: `Api::V1::OpportunitiesController`

Endpoint:
- `POST /api/v1/opportunities`

Strong params atuais:
- `name`
- `email`
- `phone`
- `source`
- `value_estimate`

Comportamento:
- Vincula à primeira `Firm`.
- Define `stage = "lead"`.

Gap crítico:
- O frontend envia `area_interest`, `description` e `stage`, mas o backend descarta esses campos porque não estão permitidos.
- A especificação pede área jurídica, breve descrição e consentimento LGPD. Esses campos ainda não têm persistência adequada em `opportunities`.
- Não há antispam/rate limit identificado.
- Não há registro explícito de consentimento.

## Contratos do Portal do Cliente

### Login

Controller: `Api::V1::AuthController`

Endpoint:
- `POST /api/v1/auth/login`

Entrada:
- `email`
- `password`

Retorno:
- `token`
- `user.id`
- `user.name`
- `user.email`
- `user.role`
- `user.client_id`

Autorização:
- Exige que o usuário tenha `AccountMembership` vinculada a `Account` e `Client`.

Estado atual:
- Token gerado por `Rails.application.message_verifier(:portal_auth)`.
- Expiração de 24h.
- Frontend usa Bearer token.

Gap frente à especificação:
- Não é JWT.
- Não usa cookie HTTP-only.
- Não há refresh token.
- Não há MFA.
- Não há recuperação de acesso API dedicada.
- Não há rate limit explícito.
- Não há preservação de `returnUrl`.

### Sessão Atual

Endpoint:
- `GET /api/v1/auth/me`

Autenticação:
- Bearer token.

Retorno:
- dados básicos do usuário e cliente.

### Dashboard Agregado

Controller:
- `Api::V1::PortalController`

Endpoint:
- `GET /api/v1/portal`

Serializer:
- `Portal::ClientDashboardSerializer`

Retorno de alto nível:
- `name`
- `cnpj`
- `profile`
- `default_chat_room_id`
- `stats`
- `conversations`
- `matters`
- `recent_prazos`
- `recent_documents`

Dados incluídos por processo:
- dados básicos do processo
- fase atual
- timeline de fases
- andamentos
- audiências futuras
- participantes
- checklist vazio
- financeiro
- recursos/petições derivados de tarefas e updates
- prazos derivados de tarefas
- storage/document folders/documents
- resumo documental

Status:
- Funcional para primeira renderização.
- Usa dados persistidos, não mock permanente.

Gaps:
- Payload agregado tende a crescer demais.
- Não há paginação.
- Não há filtros server-side.
- Não há endpoints granulares por módulo.
- Não há controle de leitura de notificações/andamentos.
- Alguns dados são derivados ou placeholders: checklist vazio, documentos financeiros vazios, audiência realizada vazia, participantes simplificados.
- Gantt/Kanban são gerados/derivados no frontend, não como workflow autoritativo.

### Perfil

Controller:
- `Api::V1::PortalProfileController`

Endpoints:
- `GET /api/v1/portal_profile`
- `PATCH /api/v1/portal_profile`

Persiste:
- `User.name`
- `User.email`
- `Client.name`
- `Client.document_number`
- `ClientPortalProfile` com telefone, endereço e preferências.

Status:
- Funcional.

Gaps:
- Sem reautenticação para e-mail/senha.
- Sem alteração de senha.
- Sem MFA.
- Sem sessões ativas.
- Sem auditoria explícita para alterações críticas além de PaperTrail em `User`/`Client`.

### Mensagens

Controller:
- `Api::V1::PortalMessagesController`

Endpoint:
- `POST /api/v1/portal_messages`

Entrada:
- `message.content`
- `message.chat_room_id`

Retorno:
- mensagem serializada.

Status:
- Persistente.

Gaps:
- Não há endpoint para listar thread paginada; listagem vem no dashboard agregado.
- Não há anexos.
- Não há retry/idempotency key.
- Não há marcação de leitura.
- Não há sanitização explícita além da renderização React no frontend.

### Financeiro por Processo

Controller:
- `Api::V1::Matters::TransactionsController`

Endpoint:
- `GET /api/v1/matters/:matter_id/transactions`

Status:
- Existe, mas não herda `BaseController`.

Risco crítico:
- Endpoint não autentica nem verifica se o usuário pode ver o processo.
- Deve ser protegido antes de uso público em produção.

## Modelos Relevantes

Clientes e acesso:
- `User`
- `Role`
- `Permission`
- `UserRole`
- `Account`
- `AccountMembership`
- `Client`
- `ClientPortalProfile`

Processos:
- `Matter`
- `MatterEvent`
- `MatterClientUpdate`
- `MatterInternalNote`
- `MatterPhaseTransition`
- `Task`
- `Meeting`
- `Document`
- `DocumentVersion`
- `Publication`

Financeiro:
- `Transaction`
- `Invoice`
- `Contract`
- `Subscription`

CMS/SEO:
- `Area`
- `Service`
- `Article`
- `Author`
- `FaqItem`
- `GlossaryTerm`
- `SeoMetadatum`
- `Redirect`
- `Banner`
- `Opportunity`
- `Lead`

## Autorização e RBAC

Stack:
- Devise no `User`.
- Pundit em `ApplicationController`.
- Policies em `backend/app/policies`.
- Roles via tabela `roles` + `user_roles`.
- Portal usa `AccountMembership.role` para perfil do cliente.

Roles internas identificadas:
- `super_admin`
- `firm_admin`
- `lawyer`
- `paralegal`
- `finance`
- `content_editor`
- `content_manager`
- `support`

Roles de cliente identificadas:
- `client_owner`
- `client_member`
- `client_readonly`

Status:
- Active Admin usa `ActiveAdmin::PunditAdapter`.
- Existe `AdminDefaultPolicy`.
- `BannerPolicy` e demais policies existem.

Gaps:
- Endpoints API fora do portal agregado nem sempre usam Pundit.
- `GET /api/v1/matters/:matter_id/transactions` precisa autenticação/autorização.
- Não há política explícita por endpoint do portal além de vínculo ao cliente.
- Não há RLS no PostgreSQL.

## Uploads e Documentos

Estado atual:
- Active Storage configurado.
- `Document` tem `has_one_attached :file`.
- Portal recebe documentos via serializer.

Gaps frente à especificação:
- Não há endpoint portal para upload.
- Não há endpoint portal para download.
- Não há URLs assinadas expostas ao cliente.
- Não há validação de MIME/tamanho/categoria em endpoint público.
- Não há progresso/cancelamento/retry no frontend conectado a API.

## Paginação e Filtros

Estado atual:
- APIs públicas e portal agregado não possuem paginação explícita.
- Artigos e glossary retornam listas diretas.
- Portal retorna tudo do cliente no payload agregado.

Gaps:
- Necessário adicionar paginação/filtros para processos, documentos, mensagens, andamentos, prazos, audiências e financeiro.
- Busca com debounce no frontend depende de endpoints filtráveis.

## Serializers e Contratos

Serializer principal:
- `Portal::ClientDashboardSerializer`

Pontos positivos:
- Centraliza o contrato atual do portal.
- Evita mock permanente.
- Já entrega dados para vários módulos.

Riscos:
- Mistura labels visuais com dados de domínio.
- Calcula prazos visualmente (`distance_label`, `deadline_percent`) no serializer, mas não há fonte jurídica autoritativa.
- Alguns campos são placeholders.
- Pode gerar payload pesado conforme crescimento de dados.

## Testes Backend

Specs existentes:
- `backend/spec/requests/api/v1/cms_endpoints_spec.rb`
- `backend/spec/requests/api/v1/crm_and_finance_endpoints_spec.rb`
- `backend/spec/requests/api/v1/portal_endpoints_spec.rb`
- specs de models e policies.

Cobertura relevante:
- Artigos publicados.
- Glossário.
- Banners ativos.
- Oportunidades.
- Login portal.
- Dashboard portal.
- Perfil portal.
- Mensagem persistida.
- Policies do backoffice.

Gaps:
- Sem testes para uploads portal.
- Sem testes de autorização no endpoint de transactions por matter.
- Sem testes de expiração de token.
- Sem testes de sessão por cookie.
- Sem E2E.
- Sem testes de rate limit.

## Segurança e Privacidade

Pontos positivos:
- Devise com bcrypt.
- Pundit/RBAC para Active Admin.
- CORS configurável.
- PaperTrail em modelos sensíveis como `User`, `Client`, `Matter`, `Document`.
- Logs filtram parâmetros via initializer padrão.

Riscos/gaps:
- Token do portal fica no `localStorage`.
- Não há cookie Secure/HttpOnly/SameSite para portal.
- Não há CSRF específico para API cookie-based.
- Não há rate limit.
- Não há MFA.
- Não há endpoint de logout/invalidar sessão.
- Não há URL assinada de documentos para o portal.
- Endpoint de transactions sem autenticação.
- Lead form ainda não persiste consentimento LGPD.

## Conclusão da Auditoria Backend

O backend permite evoluir a UI mobile first sem mocks permanentes para dashboard, processos, andamentos, documentos listados, mensagens simples, perfil e financeiro básico. Porém as funcionalidades da especificação exigem uma segunda camada de endpoints granulares, autorização por recurso, upload/download seguro e autenticação mais forte.

Recomendação de ordem:
1. Proteger imediatamente endpoints públicos sensíveis, começando por transactions.
2. Planejar migração de Bearer/localStorage para cookie HTTP-only.
3. Criar contratos granulares para processos, documentos, mensagens, prazos e audiências.
4. Adicionar upload/download com Active Storage assinado e validação.
5. Adicionar fields de LGPD/descrição/área jurídica em oportunidades ou lead específico.
6. Só então implementar módulos avançados como checklist, notificações lidas, Gantt/Kanban autoritativos e configurações de segurança.
