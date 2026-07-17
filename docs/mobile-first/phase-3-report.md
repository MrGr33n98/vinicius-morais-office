# Fase 3 - Autenticacao e Shell do Portal

Data: 2026-07-17

## Escopo desta entrega

Primeiro bloco da Fase 3, focado em melhorar a jornada de login, preservar `returnUrl` de forma segura e organizar a navegacao mobile do portal com bottom navigation enxuta e bottom sheet "Mais".

## TASK-040 - Login responsivo

### Diagnostico

A tela de login ja havia sido redesenhada, mas ainda nao preservava a rota original apos redirecionamento para login e nao informava claramente quando a sessao havia expirado.

### Arquivos alterados

- `frontend/src/app/portal/login/page.js`
- `frontend/src/app/globals.css`

### Implementacao

- Adicionado suporte a `returnUrl` somente para caminhos internos iniciados por `/portal`.
- Adicionado aviso de sessao expirada via query `expired=1`.
- Adicionado estado visual informativo separado do estado de erro.
- Mantido login existente via API `/api/v1/auth/login`.

### Criterios de aceite

- [x] Redirecionamento nao aceita URL externa.
- [x] Sessao expirada mostra aviso claro ao cliente.
- [x] Estado de erro continua sem revelar se o e-mail existe.
- [x] Fluxo existente de login foi preservado.

## TASK-043/TASK-044 - Rota privada e sessao expirada

### Diagnostico

O portal ja verificava `user_token` em `localStorage` e redirecionava para `/portal/login` quando ausente ou invalido. Faltava preservar o destino original e comunicar a expiracao.

### Arquivos alterados

- `frontend/src/app/portal/page.js`

### Implementacao

- Quando a API do portal responde `401` ou `403`, o frontend limpa credenciais locais e redireciona para `/portal/login?expired=1&returnUrl=...`.
- O `returnUrl` usa `window.location.pathname + window.location.search`, codificado, e o login aceita apenas rotas internas do portal.

### Criterios de aceite

- [x] Usuario sem sessao continua sendo redirecionado.
- [x] Sessao expirada nao quebra a aplicacao.
- [x] Rota original e preservada quando segura.

## TASK-045/TASK-046/TASK-047 - Shell mobile do portal

### Diagnostico

O portal ja tinha CSS que transformava a sidebar em barra inferior no mobile, mas ela exibia muitos itens em scroll horizontal. A especificacao pede uma bottom navigation enxuta com "Mais" abrindo uma folha inferior.

### Arquivos alterados

- `frontend/src/app/portal/page.js`
- `frontend/src/app/globals.css`

### Implementacao

- Bottom navigation mobile prioriza: Dashboard, Processos, Prazos, Mensagens e Mais.
- Itens secundarios foram movidos para `BottomSheet` "Mais opções".
- O bottom sheet usa o primitivo da Fase 1, com Escape, foco controlado e bloqueio de scroll.
- Logout tambem aparece no bottom sheet mobile.

### Criterios de aceite

- [x] Bottom navigation fica mais curta e previsivel no mobile.
- [x] "Mais" abre bottom sheet com opcoes secundarias.
- [x] Navegacao desktop por sidebar foi preservada.
- [x] Alvos mobile mantem pelo menos 44px.

## Validacoes executadas

- `npm run lint`: passou.
- `npm run build`: passou.
- `git diff --check`: pendente nesta fase ate a consolidacao final do conjunto de arquivos.

Observacao: durante o build, o Next registrou `fetch failed` ao coletar paginas que consultam backend local indisponivel, mas o build terminou com sucesso. O aviso de root do Turbopack por lockfile externo permanece.

## Pendencias

- Migrar autenticacao de `localStorage` para cookies HTTP-only em uma etapa coordenada com o backend.
- Implementar recuperacao de acesso.
- Implementar MFA somente se o backend suportar.
- Adicionar estado offline global.
- Adicionar testes E2E de login, expiracao de sessao e retorno para rota original.
