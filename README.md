# Plataforma Jurídica Digital ADVINI — Cuiabá & MT

Este repositório contém a solução integrada de portal do cliente, CMS de SEO e backoffice operacional para o escritório **Vinicius Morais Advocacia**.

A solução é composta por:
1. **Backend (Ruby on Rails 8.0)**: API de banco de dados, painel administrativo do ActiveAdmin, segurança RBAC/Pundit, LGPD Shield e pipeline de publicação de conteúdo (Sidekiq + Redis).
2. **Frontend (Next.js 16)**: Landing page pública de alto apelo estético otimizada para SEO local, Blog de autoridade, Glossário jurídico e Portal do Cliente seguro.

---

## 🛠️ Tecnologias e Arquitetura

### Backend:
*   **Ruby on Rails 8.0.5** & **Ruby 3.2.2**
*   **ActiveAdmin 3.5.2** (CMS & Operacional)
*   **Pundit** (Políticas de segurança granular)
*   **Devise** (Autenticação unificada de usuários e clientes)
*   **PostgreSQL** & **Redis** (Sidekiq jobs)
*   **PaperTrail** (Auditoria de ações críticas para LGPD)

### Frontend:
*   **Next.js 16.2.10 (App Router & Turbopack)**
*   **Vanilla CSS Design System** (Sem Tailwind para alta flexibilidade estética)
*   **ISR (Incremental Static Regeneration)** (Atualização de blog a cada 60s)
*   **SSG (Static Site Generation)** (Geração de glossário em tempo de build)

---

## 🚀 Como Executar o Ecossistema

### Passo 1: Subir o Banco de Dados & Redis (Docker)
Na raiz do projeto, inicialize os containers do banco de dados PostgreSQL (escutando na porta pública `5499` para evitar conflito com instâncias locais do Windows) e do Redis:
```bash
docker-compose up -d
```

### Passo 2: Inicializar o Backend (Rails)
1. Navegue até a pasta do backend:
   ```bash
   cd backend
   ```
2. Instale as dependências:
   ```bash
   bundle install
   ```
3. Prepare o banco de dados (migrações e dados iniciais):
   ```bash
   bundle exec rails db:migrate
   bundle exec rails db:seed
   ```
4. Inicie o servidor:
   ```bash
   bundle exec rails server
   ```
   *O backend estará acessível em: `http://localhost:3000`*
   *O painel do ActiveAdmin estará em: `http://localhost:3000/admin`*

### Passo 3: Inicializar o Frontend (Next.js)
1. Abra outro terminal e navegue até a pasta do frontend:
   ```bash
   cd frontend
   ```
2. Instale as dependências npm:
   ```bash
   npm install
   ```
3. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   *A Landing Page estará acessível em: `http://localhost:3000` ou `http://localhost:4000` conforme a porta aberta pelo dev server.*

---

## 🔑 Credenciais de Teste

Para facilitar a homologação e demonstração do sistema, utilize os seguintes acessos mockados pré-configurados:

*   **Acesso Administrativo (ActiveAdmin)**:
    *   *URL*: `http://localhost:3000/admin`
    *   *E-mail*: `admin@example.com`
    *   *Senha*: `password`
*   **Acesso do Cliente (Portal do Cliente)**:
    *   *URL*: `http://localhost:3000/portal/login`
    *   *E-mail*: `cliente@advini.com`
    *   *Senha*: `senha123`

---

## 🧪 Rodando os Testes Automatizados

A suíte de testes RSpec cobre todas as regras de negócios, validações CNJ de processos, políticas do Pundit e callbacks de slug do CMS.
Para executar toda a suíte:
```bash
cd backend
bundle exec bin/rspec spec
```
*(Saída atual de homologação: 110 exemplos, 0 falhas, 100% verde)*
# vinicius-morais-office
