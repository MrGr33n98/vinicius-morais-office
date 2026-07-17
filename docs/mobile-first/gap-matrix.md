# TASK-003 — Matriz de Gaps Mobile First

Data: 2026-07-17  
Referências: `docs/folha.png` e `docs/folha-2.png`

Legenda:
- Existente: já existe e pode ser mantido.
- Parcial: existe, mas precisa ajuste técnico/UX.
- Ausente: não existe.
- Reutilizável: base atual pode ser extraída/reaproveitada.
- Necessita backend: exige API/modelo/migração/autorização.
- Necessita design: exige refinamento visual/UX.
- Risco técnico: ponto de atenção antes de implementar.

## Landing Page

| Tela/Feature | Estado | Reutilizável | Necessita backend | Necessita design | Risco técnico |
|---|---:|---:|---:|---:|---|
| Home `/` | Parcial | Sim | Não | Sim | Arquivo monolítico e muitos estilos inline |
| Header mobile com hamburger/drawer | Parcial | Sim | Não | Sim | Falta focus trap, Escape, backdrop e scroll lock |
| Topbar/banner dinâmico | Existente | Sim | Não | Sim | Só há placement `topbar` |
| Hero mobile com CTAs antes da imagem | Parcial | Sim | Não | Sim | Já houve overflow mobile; precisa validação 320-430px |
| Mockup portal no hero | Parcial | Sim | Não | Sim | Imagem precisa dimensões e CLS revisados |
| Formulário de análise jurídica | Parcial | Sim | Sim | Sim | Backend descarta área/descrição/LGPD |
| Áreas de atuação na landing | Parcial | Sim | Sim | Sim | Cards são estáticos; páginas por slug ausentes |
| `/areas-de-atuacao` | Ausente | Parcial | Sim | Sim | SEO local depende de rotas reais |
| `/areas-de-atuacao/[slug]` | Ausente | Parcial | Sim | Sim | Exige contrato com `Area`/`Service` |
| Sobre | Parcial | Sim | Não | Sim | Só seção/âncora, não página `/sobre` |
| Como funciona | Parcial | Sim | Não | Sim | Só seção/âncora, não página `/como-funciona` |
| Recursos | Parcial | Sim | Não | Sim | Não há página `/recursos` |
| Demonstração da Área do Cliente | Parcial | Sim | Não | Sim | Falta modal/vídeo acessível |
| Prova social/depoimentos | Parcial | Sim | Sim | Sim | Dados estáticos; autorização/publicação não modelada |
| Presença regional | Parcial | Sim | Sim | Sim | Cidades estáticas; páginas locais ausentes |
| Blog listagem `/blog` | Parcial | Sim | Não | Sim | Sem paginação/categorias/imagem/tempo de leitura |
| Blog detalhe `/blog/[slug]` | Parcial | Sim | Não | Sim | Metadata parcial; schema BlogPosting ausente |
| FAQ | Parcial | Sim | Sim | Sim | FAQ está em seção, não vem de endpoint por página |
| Contato | Parcial | Sim | Sim | Sim | Formulário principal usa opportunity com campos incompletos |
| CTA fixo mobile | Parcial | Sim | Não | Sim | Existe assistente/WhatsApp, não barra contextual da folha |
| Footer mobile accordion | Ausente | Parcial | Não | Sim | Footer atual é grid desktop |
| Políticas/termos | Ausente | Não | Talvez | Sim | Links existem sem páginas reais |
| Metadata por rota | Parcial | Sim | Sim | Sim | Rotas institucionais ausentes |
| Sitemap/robots/canonical | Parcial | Não | Não | Não | Não há geração Next dedicada |
| Schemas Organization/LegalService | Parcial | Sim | Não | Sim | LegalService existe inline; falta padronização |
| Analytics landing | Ausente | Não | Não | Não | PostHog não instalado |

## Área do Cliente

| Tela/Feature | Estado | Reutilizável | Necessita backend | Necessita design | Risco técnico |
|---|---:|---:|---:|---:|---|
| `/portal/login` | Parcial | Sim | Sim | Sim | Token em localStorage; sem returnUrl/MFA |
| Recuperação de acesso | Ausente | Não | Sim | Sim | Devise existe, fluxo portal não |
| Middleware de rota privada | Ausente | Não | Sim | Não | Proteção atual é client-side |
| Shell desktop com sidebar | Existente | Sim | Não | Parcial | Precisa preservar desktop |
| Shell mobile com bottom navigation de 5 itens | Parcial | Sim | Não | Sim | Atual reaproveita sidebar inteira como bottom bar |
| Drawer/Bottom sheet "Mais" | Ausente | Parcial | Não | Sim | Necessita focus trap e safe area |
| Mobile top bar | Parcial | Sim | Não | Sim | Não segue a folha 2 completamente |
| Dashboard | Parcial | Sim | Não | Sim | Ainda usa grid/tabela em alguns blocos |
| Cards de resumo | Parcial | Sim | Não | Sim | Ordem e densidade mobile precisam revisão |
| Processos listagem | Parcial | Sim | Sim | Sim | Não há rota real, filtros server-side ou debounce |
| Card de processo mobile | Parcial | Sim | Não | Sim | Tabela ainda aparece no dashboard |
| Processo detalhe | Parcial | Sim | Não | Sim | Subtelas são tabs internas, não rotas |
| Visão geral do processo | Parcial | Sim | Não | Sim | Próxima ação precisa prioridade visual |
| Andamentos | Parcial | Sim | Sim | Sim | Sem marcar como lido/explicar andamento |
| Prazos e intimações | Parcial | Sim | Sim | Sim | Prazos derivados de tarefas; intimações não separadas |
| Audiências | Parcial | Sim | Sim | Sim | Sem ICS, checklist persistente, mapa/link separado |
| Documentos listagem | Parcial | Sim | Sim | Sim | Sem download seguro, upload, visualizador |
| Documentos upload | Ausente | Não | Sim | Sim | Requer endpoint, validação, URL assinada |
| Recursos e petições | Parcial | Sim | Sim | Sim | Derivado de tasks/updates, sem modelo dedicado |
| Financeiro | Parcial | Sim | Sim | Sim | Endpoint de transactions sem autenticação; faturas/checkout ausentes |
| Mensagens | Parcial | Sim | Sim | Sim | Envio simples; sem anexos, paginação, leitura |
| Perfil | Parcial | Sim | Sim | Sim | Dados persistem; sem senha/MFA/sessões |
| Configurações | Ausente | Parcial | Sim | Sim | Preferências estão dentro de perfil |
| Ajuda | Ausente | Parcial | Sim | Sim | Sem FAQ/ticket do portal |
| Offline state | Ausente | Não | Não | Sim | Não há detecção global |
| Sessão expirada | Parcial | Sim | Sim | Sim | Redireciona, mas sem aviso ou returnUrl |
| Sem permissão | Parcial | Sim | Sim | Sim | Tratamento genérico |
| Skeletons | Parcial | Sim | Não | Sim | Loading é simples, não skeleton por módulo |
| Estado vazio | Parcial | Sim | Não | Sim | Alguns placeholders, não padronizado |
| Erro/retry | Parcial | Sim | Não | Sim | Retry limitado |

## Cronograma, Gantt e Kanban

| Tela/Feature | Estado | Reutilizável | Necessita backend | Necessita design | Risco técnico |
|---|---:|---:|---:|---:|---|
| Linha do tempo processual | Parcial | Sim | Não | Sim | Base vem de `timeline_phases` |
| Gantt desktop | Parcial | Sim | Sim | Sim | Datas são calculadas/derivadas no frontend |
| Gantt mobile scroll horizontal | Parcial | Sim | Não | Sim | Precisa validar conflito scroll vertical/horizontal |
| Zoom mês/trimestre/processo | Parcial | Sim | Não | Sim | Estado local, sem persistência |
| Marcador "Hoje" | Parcial | Sim | Não | Sim | Precisa validar cálculo/localização |
| Detalhe em bottom sheet | Ausente | Parcial | Não | Sim | Painel atual não é bottom sheet mobile |
| Kanban somente leitura | Parcial | Sim | Sim | Sim | Cards são derivados; não há workflow backend |
| Kanban carrossel mobile | Parcial | Sim | Não | Sim | CSS já tem snap, precisa selector/indicador |
| Filtros Gantt/Kanban | Parcial | Sim | Sim | Sim | Filtros client-side |
| Exportação | Ausente | Não | Talvez | Sim | Baixa prioridade |

## Backend e Dados

| Capacidade | Estado | Reutilizável | Necessita backend | Risco técnico |
|---|---:|---:|---:|---|
| CMS de banners | Existente | Sim | Não | Placement limitado |
| CMS de artigos | Parcial | Sim | Sim | Sem paginação/categorias |
| CMS de áreas/serviços | Parcial | Sim | Sim | Sem endpoints públicos dedicados |
| Lead/opportunity | Parcial | Sim | Sim | Campos do formulário não persistem todos |
| Portal dashboard agregado | Existente | Sim | Não | Payload tende a crescer |
| Perfil persistente | Existente | Sim | Não | Sem validação avançada/reautenticação |
| Mensagem persistente | Parcial | Sim | Sim | Sem anexos/paginação/leitura |
| Documentos | Parcial | Sim | Sim | Sem upload/download seguro no portal |
| Financeiro | Parcial | Sim | Sim | Transactions endpoint sem auth |
| Auth portal | Parcial | Sim | Sim | Token localStorage |
| RBAC/Pundit | Parcial | Sim | Sim | Nem todo endpoint API usa policy |
| Auditoria | Parcial | Sim | Sim | PaperTrail parcial |

## Gaps P0

1. Autenticação portal não atende cookies HTTP-only, returnUrl e middleware.
2. Bottom navigation mobile precisa ser redesenhada para 5 itens + "Mais".
3. Landing header mobile precisa drawer acessível.
4. Oportunidade/lead precisa persistir área jurídica, descrição e LGPD.
5. Endpoint de transactions precisa autenticação/autorização.
6. Documentos precisam endpoints seguros antes de upload/download.
7. Portal precisa trocar tabelas mobile por cards/listas onde necessário.
8. Rotas internas do portal precisam sair de estado local para URLs reais ou, no mínimo, deep links controlados.

## Gaps P1

1. Gantt/Kanban precisam contratos mais autoritativos no backend.
2. Mensagens precisam anexos, paginação e leitura.
3. Prazos/intimações precisam modelo/endpoint separado.
4. Audiências precisam checklist persistente e exportação ICS.
5. Configurações e ajuda precisam telas reais.
6. Analytics e Sentry precisam implantação.

## Gaps P2

1. PWA/offline parcial.
2. Exportações avançadas.
3. Tema claro/escuro completo.
4. Autoplay/carrosséis refinados.
5. Personalizações visuais avançadas.

## Recomendação de Execução

Não implementar a landing e o portal inteiro de uma vez. Ordem sugerida para as próximas fases:

1. TASK-010: consolidar tokens e remover duplicação crítica entre CSS e JS.
2. TASK-011: extrair primitives mínimas (`Button`, `Input`, `Card`, `Badge`, `Skeleton`, `ErrorState`, `EmptyState`, `Drawer`, `BottomSheet`, `Tabs`).
3. TASK-012: criar shell responsivo público e shell portal mobile com bottom navigation real.
4. TASK-040 a TASK-046: corrigir autenticação e navegação do portal.
5. TASK-020 a TASK-023: refinar landing mobile com header, hero, form e áreas.
6. TASK-050 a TASK-060: refinar dashboard/processos mobile.
7. TASK-078/TASK-079: documentos seguros, pois têm impacto direto de segurança e valor para o SaaS.

## Critérios de Pronto para Avançar à Fase 1

- Esta matriz revisada e aprovada.
- Decisão sobre migração para TypeScript/Tailwind ou manutenção incremental em JS/CSS.
- Decisão sobre biblioteca de ícones.
- Decisão sobre autenticação: manter Bearer temporariamente ou iniciar migração para cookies HTTP-only.
- Priorização confirmada dos P0.
