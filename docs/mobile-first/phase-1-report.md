# Fase 1 - Fundação Mobile First

Data: 2026-07-17

## Escopo

Implementação da base reutilizável para a refatoração mobile-first da landing page e da Área do Cliente, sem substituir ainda as telas produtivas atuais.

## TASK-010 - Consolidar design tokens

### Diagnóstico

O projeto não possuía Tailwind nem um arquivo central de tokens. As cores, espaçamentos e estilos estavam distribuídos principalmente em `globals.css`.

### Arquivos alterados

- `frontend/src/lib/design-tokens.js`
- `frontend/src/app/globals.css`

### Implementação

- Criado mapa JS de tokens para cores institucionais, cores operacionais, espaçamentos, bordas, sombras, z-index e breakpoints.
- Consolidado bloco CSS com variáveis prefixadas por `--vm-*`.
- Adicionados safe areas, foco visível e suporte a `prefers-reduced-motion`.

### Critérios de aceite

- [x] Tokens centralizados.
- [x] Valores CSS prefixados para evitar colisão com estilos legados.
- [x] Safe area para mobile.
- [x] Base de contraste com navy, dourado, roxo operacional e estados semânticos.

## TASK-011 - Criar componentes primitivos

### Arquivos alterados

- `frontend/src/components/ui/primitives.js`
- `frontend/src/app/globals.css`

### Implementação

Componentes criados:

- `Button`
- `IconButton`
- `Field`
- `Input`
- `Select`
- `Textarea`
- `Checkbox`
- `Switch`
- `Badge`
- `Card`
- `Skeleton`
- `EmptyState`
- `ErrorState`
- `Dialog`
- `Drawer`
- `BottomSheet`
- `Tabs`
- `Accordion`
- `Toast`

### Critérios de aceite

- [x] Alvos interativos com pelo menos 44px.
- [x] Estados de foco visíveis.
- [x] Dialog, Drawer e BottomSheet com Escape, bloqueio de scroll e retorno de foco.
- [x] Estados de loading, vazio e erro disponíveis.
- [x] Componentes isolados sem dados mockados permanentes.

## TASK-012 - Criar shell responsivo

### Arquivos alterados

- `frontend/src/components/shell/public-shell.js`
- `frontend/src/components/shell/portal-shell.js`
- `frontend/src/app/globals.css`

### Implementação

- `PublicHeader` com drawer mobile, skip link e navegação acessível.
- `PublicFooter` com accordions no mobile e colunas no desktop.
- `PortalMobileHeader`.
- `PortalDesktopSidebar`.
- `PortalBottomNavigation`.
- `PortalMoreSheet`.
- `PortalShell` para composição futura do dashboard.

### Critérios de aceite

- [x] Header público sem overflow em 320px.
- [x] Drawer mobile com foco controlado.
- [x] Bottom navigation respeitando safe area.
- [x] Shell desktop preservado por breakpoint.
- [x] Padrão pronto para conexão futura com rotas reais.

## TASK-013 - Acessibilidade base

### Arquivos alterados

- `frontend/src/components/ui/primitives.js`
- `frontend/src/components/shell/public-shell.js`
- `frontend/src/app/globals.css`

### Implementação

- Skip link para conteúdo principal.
- Foco visível em controles principais.
- Labels e `aria-describedby` para campos com erro.
- `aria-expanded`, `aria-controls`, `role="dialog"`, `aria-modal` e `role="switch"`.
- Trap básico de foco em camadas.
- Redução de movimento via media query.

### Critérios de aceite

- [x] Navegação por teclado nos componentes críticos.
- [x] Modais e drawers fecham com Escape.
- [x] Estados não dependem apenas de cor.
- [x] Mensagens de erro podem ser associadas aos campos.

## Demonstração interna

### Arquivos alterados

- `frontend/src/app/design-system/page.js`
- `frontend/src/app/design-system/demo-client.js`

### Resultado

Criada a rota interna `/design-system` como página de demonstração dos tokens, primitivos, estados, camadas e shells responsivos.

## Validações executadas

- `npm run lint -- src/app/design-system/page.js src/app/design-system/demo-client.js src/components/ui/primitives.js src/components/shell/public-shell.js src/components/shell/portal-shell.js`: passou.
- `npm run lint`: passou.
- `npm run build`: passou.

Observação: durante o build, o Next registrou `fetch failed` ao coletar dados de páginas que dependem do backend local, mas o build finalizou com sucesso. Também apareceu o aviso existente de root do Turbopack por haver lockfile fora do projeto.

## Evidências

- Página de demonstração: `/design-system`.
- Screenshot mobile: pendente, pois o repositório ainda não possui Playwright/Storybook configurado para captura automática.
- Screenshot desktop: pendente pelo mesmo motivo.

## Pendências

- Conectar os shells às telas reais em fases posteriores.
- Substituir gradualmente componentes monolíticos atuais pelos primitivos.
- Adicionar testes automatizados de interação quando a suíte frontend for definida.
- Gerar screenshots visuais após configurar Playwright ou ferramenta equivalente.
