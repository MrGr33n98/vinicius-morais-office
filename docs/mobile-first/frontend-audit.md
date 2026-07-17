# TASK-001 — Auditoria do Frontend Mobile First

Data: 2026-07-17  
Referências visuais analisadas: `docs/folha.png` e `docs/folha-2.png`

## Sumário Executivo

O frontend atual já possui uma landing institucional, login do portal e uma área do cliente funcional, consumindo dados reais do Rails em pontos centrais. Porém a implementação está concentrada em poucos arquivos grandes, usa JavaScript em vez de TypeScript, estilos mistos entre CSS global e inline styles, autenticação com token em `localStorage` e não possui a base técnica pedida na especificação para uma evolução mobile first robusta.

O caminho recomendado é preservar o desktop existente, mas extrair gradualmente componentes e shells responsivos antes de redesenhar telas. A prioridade técnica é criar fundação: tokens, componentes primitivos, header/drawer público, shell mobile do portal e camada de API/autenticação.

## Referências Visuais

### `folha.png` — Landing Page Mobile First

Direção visual:
- Estilo jurídico premium com fundo navy escuro e dourado como destaque.
- Hero mobile com logo, menu hamburger, headline forte, CTA principal, CTA secundário e mockup do portal.
- Mapa de páginas: Home, Sobre, Como Funciona, Recursos, Depoimentos, Blog, Contato e Portal do Cliente.
- Componentes esperados: botões primário/secundário, ícones jurídicos/operacionais, chips/status, cards mobile, footer escuro e CTA fixo.
- Grid mobile sugerido: 4 colunas, gutter 16px, margens 16px, espaçamentos de 8 a 64px.
- SEO técnico explicitado: title, meta description, URL amigável, H1 único, headings, imagens otimizadas, schema.org, sitemap e robots.

### `folha-2.png` — Área do Cliente Mobile First

Direção visual:
- Portal operacional claro, cards brancos, acento roxo, tipografia Inter/SF Pro.
- Bottom navigation fixa com Início, Processos, Prazos, Mensagens e Mais.
- Telas mobile prioritárias: Dashboard, Meus Processos, Prazos e Intimações, Audiências, Documentos, Comunicações, Financeiro, Meu Perfil, Configurações e Ajuda.
- Componentes esperados: cards compactos, badges textuais, busca, tabs, listas, botões roxos, toggles, menu principal e estados por status.
- Boas práticas explícitas: ações ao alcance do polegar, informações em cards, feedback visual, notificações, modo escuro opcional e acessibilidade.

## Stack Identificada

Frontend:
- Next.js `16.2.10`.
- React `19.2.4`.
- App Router em `frontend/src/app`.
- JavaScript (`.js`), não TypeScript.
- CSS global em `frontend/src/app/globals.css`.
- `next/font` com Inter e Outfit em `layout.js`.
- `next/image` usado em landing e login.
- Sem Tailwind CSS instalado.
- Sem React Query.
- Sem Zod.
- Sem React Hook Form.
- Sem PostHog.
- Sem Sentry.
- Sem Radix UI.
- Sem lucide-react; ícones são SVGs inline ou emojis.
- Sem Playwright/Cypress/Storybook configurado.

Scripts:
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`

## Rotas Públicas e Privadas

Rotas existentes no App Router:

Públicas:
- `/`
- `/blog`
- `/blog/[slug]`
- `/glossario`
- `/glossario/[slug]`
- `/portal/login`

Privada no frontend:
- `/portal`

Rotas sugeridas na especificação ainda ausentes:
- `/sobre`
- `/como-funciona`
- `/areas-de-atuacao`
- `/areas-de-atuacao/[slug]`
- `/recursos`
- `/depoimentos`
- `/contato`
- `/politica-de-privacidade`
- `/termos-de-uso`
- `/portal/processos`
- `/portal/processos/[id]`
- `/portal/processos/[id]/andamentos`
- `/portal/processos/[id]/cronograma`
- `/portal/processos/[id]/gantt`
- `/portal/processos/[id]/kanban`
- `/portal/processos/[id]/prazos`
- `/portal/processos/[id]/audiencias`
- `/portal/processos/[id]/documentos`
- `/portal/processos/[id]/recursos`
- `/portal/mensagens`
- `/portal/financeiro`
- `/portal/perfil`
- `/portal/configuracoes`
- `/portal/ajuda`

Observação: grande parte dessas experiências existe como estado interno em `/portal`, não como rotas reais indexáveis/navegáveis.

## Layouts

Arquivos:
- `frontend/src/app/layout.js`
- `frontend/src/app/page.js`
- `frontend/src/app/portal/login/page.js`
- `frontend/src/app/portal/page.js`
- `frontend/src/app/globals.css`

Layout raiz:
- Define `lang="pt-BR"`.
- Define viewport básico.
- Carrega Inter e Outfit.
- Define metadata global simples.
- Não há providers globais para query client, analytics, erro, toast, sessão ou tema.

Landing:
- Toda a página está em `frontend/src/app/page.js`.
- Componentes internos: `TopBar`, `Navbar`, `Hero`, `LeadForm`, seções de áreas, dashboard, estatísticas, depoimentos, localidade, blog/FAQ, contato, footer e assistente flutuante.
- Usa muitos estilos inline e tokens locais em objeto `T`.
- Topbar já consome banners reais via API.
- Hero usa formulário real de lead/opportunity.

Portal:
- Toda a área do cliente está em `frontend/src/app/portal/page.js`.
- Módulos renderizados por estado: dashboard, processos, visão geral, andamentos, cronograma/Gantt, quadro processual/Kanban, prazos, documentos, recursos, audiências, financeiro, mensagens e perfil.
- Navegação principal ainda é sidebar desktop adaptada para bottom bar via CSS em breakpoints.
- Não há rotas por módulo; refresh ou deep link não preservam tela interna.

Login:
- `frontend/src/app/portal/login/page.js`.
- Layout visual já melhorado, porém autentica via token salvo em `localStorage`.
- Não preserva `returnUrl`.
- Não possui recuperação real de acesso nem MFA.

## Componentes Reaproveitáveis Identificados

Reaproveitáveis, mas hoje acoplados a arquivos grandes:
- Landing:
  - `TopBar`
  - `Navbar`
  - `Hero`
  - `LeadForm`
  - cards de áreas
  - FAQ accordion simples
  - footer
  - CTA/assistente flutuante
- Portal:
  - `StatusBadge`
  - `ProcessStatusBadge`
  - `DonutChart`
  - `MiniLineChart`
  - cards de estatísticas
  - timeline
  - tabs internas de processo
  - Gantt
  - Kanban somente leitura
  - lista de documentos
  - mensagens
  - formulário de perfil
- CSS global:
  - `.card`
  - `.btn`
  - `.badge`
  - `.data-table`
  - `.sidebar`
  - `.topbar`
  - `.stat-cards-grid`
  - classes de Gantt/Kanban/chat/login

Problema: esses componentes não estão em módulos reutilizáveis. Estão fechados dentro de `page.js`, dificultando testes, manutenção e evolução mobile first.

## Design Tokens

Tokens globais existentes em `globals.css`:
- Marca: `--navy-primary`, `--navy-light`, `--gold-primary`, `--gold-light`, `--gold-dark`.
- Backgrounds: `--bg-primary`, `--bg-secondary`, `--bg-card`, `--bg-muted`.
- Texto: `--text-primary`, `--text-secondary`, `--text-muted`.
- Bordas: `--border-color`, `--border-strong`.
- Status: `--color-success`, `--color-warning`, `--color-danger`, `--color-info`, `--color-purple`.
- Sidebar: `--sidebar-bg`, `--sidebar-border`, `--sidebar-text`, `--sidebar-active-bg`, etc.
- Layout: `--sidebar-width`, `--topbar-height`, `--radius`, `--transition`.

Tokens locais duplicados na landing:
- Objeto `T` em `frontend/src/app/page.js` define navy, gold, gray, shadows e radii.
- Isso gera divergência entre landing e portal.

Gap:
- Falta consolidar tokens de breakpoints, z-index, safe area, shadows, spacing e componentes.
- Falta migrar valores inline para tokens/classes consistentes.

## Biblioteca de Ícones

Estado atual:
- Portal usa SVGs inline definidos no objeto `Icon`.
- Landing usa emojis e poucos elementos textuais.
- Não há `lucide-react`.

Gap:
- A especificação pede uso de ícones consistentes, preferencialmente biblioteca já adotada. Como não há biblioteca, a Fase 1 deve decidir entre manter SVGs internos organizados ou adicionar `lucide-react` com justificativa.

## Formulários

Formulários existentes:
- `LeadForm` na landing.
- Login do portal.
- Perfil do portal.
- Composer de mensagens.

Estado atual:
- Validação manual com `useState`.
- Sem Zod.
- Sem React Hook Form.
- Mensagens de erro simples.
- Consentimento LGPD obrigatório no lead form.
- Login mostra erro genérico.

Gaps:
- Falta validação declarativa e acessível.
- Falta `aria-describedby` em erros por campo.
- Falta proteção contra envio duplicado em todos os formulários.
- Falta antispam no lead form.
- Falta sucesso/rollback robusto em preferências.

## Autenticação

Estado atual:
- Login chama `POST /api/v1/auth/login`.
- Backend retorna token.
- Frontend salva `user_token`, `user_role`, `user_name` e `remember_portal_access` em `localStorage`.
- `/portal` lê o token do `localStorage` e envia `Authorization: Bearer`.
- Não há middleware do Next protegendo rota antes do render.

Gap frente à especificação:
- Não usa cookies HTTP-only.
- Não há `returnUrl`.
- Não há MFA.
- Não há recuperação real de acesso.
- Não há rate limit identificado no frontend.
- Rotas privadas são protegidas client-side, não no middleware.

Risco:
- Armazenar token em `localStorage` aumenta exposição a XSS.

## Analytics e Observabilidade

Estado atual:
- Não há PostHog.
- Não há Sentry.
- Não há eventos estruturados.
- Não há boundary global de erro.

Gaps:
- Eventos mínimos de landing e portal ausentes.
- Sem sanitização de payload analítico.
- Sem tracking de conversão real.

## Testes Frontend

Estado atual:
- Apenas ESLint configurado.
- Não há testes unitários de componentes.
- Não há testes E2E.
- Não há testes visuais/responsivos.
- Não há Storybook.

Gaps:
- Falta validar breakpoints 320, 360, 375, 390, 430, 768, 1024, 1280 e 1440.
- Falta testar login, lead, portal, upload, mensagens e navegação.

## Responsividade Atual

Pontos positivos:
- `globals.css` já tem vários `@media` para portal, login e landing.
- Sidebar vira navegação inferior em <=1024px.
- Tabelas são colocadas em containers com overflow horizontal.
- Gantt e Kanban possuem tentativa de scroll/snap mobile.

Problemas:
- A navegação inferior reaproveita todos os itens da sidebar; a referência pede 5 itens principais e drawer/bottom sheet "Mais".
- Ainda há risco de scroll horizontal por estilos inline com grids fixos e cards largos.
- O portal usa muitas tabelas no mobile; a referência pede listas/cards.
- Topbar mobile não é exatamente a da folha; falta saudação compacta e ações prioritárias.
- Landing header não possui drawer mobile completo com foco, Escape e bloqueio de scroll.
- CTA fixo mobile existe como assistente/WhatsApp, mas não como barra contextual da folha.

## SEO e Metadata

Estado atual:
- Metadata global em `layout.js`.
- `generateMetadata` existe em `/blog/[slug]` e `/glossario/[slug]`.
- JSON-LD `LegalService` inline na landing.
- Não há sitemap/robots gerado pelo Next.
- `public/robots.txt` não identificado no frontend.

Gaps:
- Sem metadata por rota institucional porque as rotas ainda não existem.
- Sem canonical por rota.
- Sem Open Graph/Twitter completos.
- Sem BreadcrumbList nas páginas.
- Sem schemas específicos para FAQPage, BlogPosting, WebSite, WebPage e páginas locais.

## Riscos Técnicos

- Arquivos muito grandes: `page.js` e `portal/page.js` misturam dados, UI, estado, responsividade e regras de negócio.
- Estado interno substitui rotas: ruim para deep link, SEO, histórico e suporte.
- Tokens duplicados entre CSS e JS.
- Ausência de TypeScript dificulta contratos com API.
- Autenticação client-side com `localStorage`.
- Sem camada de API centralizada.
- Componentes não testáveis isoladamente.
- Uso de CSS `:has()` pode exigir validação de compatibilidade.
- Formulário de oportunidade envia campos que o backend não permite (`area_interest`, `description`, `stage` são descartados pelo strong params atual).

## Conclusão da Auditoria Frontend

O frontend já tem uma boa base visual e dados reais, mas não atende ainda à arquitetura mobile first especificada. A Fase 1 deve começar por fundação e extração incremental, não por redesenho direto de telas.

Recomendação de ordem:
1. Consolidar tokens e primitives.
2. Extrair camada de API e tipos/contratos.
3. Criar shell público mobile com drawer acessível.
4. Criar shell do portal com bottom nav de 5 itens + sheet "Mais".
5. Migrar módulos do portal para rotas reais gradualmente.
6. Trocar tabelas mobile por cards/listas.
7. Só depois implementar/refinar as telas das folhas.
