# Fase 2 - Landing Page Mobile First

Data: 2026-07-17

## Escopo desta entrega

Primeiro bloco da Fase 2, focado em corrigir a navegação mobile e reduzir risco de overflow na primeira dobra da landing. A página continua usando a estrutura existente em `frontend/src/app/page.js`, sem reescrever a landing inteira de uma vez.

## TASK-020 - Header e navegação mobile

### Diagnóstico

A landing possuía navegação desktop com links ocultos em mobile, mas não havia drawer acessível para recuperar esses links no celular. Em telas estreitas, os CTAs do header competiam com a marca e podiam contribuir para layout espremido.

### Arquivos alterados

- `frontend/src/app/page.js`
- `frontend/src/app/globals.css`

### Implementação

- Adicionado botão hamburger no header da landing.
- Adicionado `Drawer` mobile reutilizando os primitivos da Fase 1.
- Links principais movidos para o menu mobile com alvos de toque de pelo menos 48px.
- CTA de análise e WhatsApp disponíveis dentro do drawer.
- Em telas muito estreitas, o CTA do header é ocultado e fica disponível no menu para preservar espaço.
- Links externos com `target="_blank"` receberam `rel="noreferrer"`.

### Critérios de aceite

- [x] Menu mobile abre e fecha sem depender de hover.
- [x] Drawer usa Escape, bloqueio de scroll e retorno de foco via primitivo.
- [x] Links principais permanecem acessíveis no mobile.
- [x] Header reduz competição visual em 320px a 520px.

## TASK-021 - Hero e CTA

### Diagnóstico

O hero já possuía CTAs, imagem e formulário, mas o problema reportado no celular indicava overflow horizontal/primeira dobra desproporcional.

### Arquivos alterados

- `frontend/src/app/globals.css`

### Implementação

- Reforçadas regras mobile-first já existentes para impedir que header/hero excedam `100vw`.
- Mantido o CTA principal com rolagem para `#form`.
- Mantido CTA secundário para `/portal/login`.
- Preservada a experiência desktop.

### Critérios de aceite

- [x] CTA principal permanece acessível no mobile.
- [x] Hero continua usando imagem real otimizada já existente.
- [x] Sem alteração destrutiva do desktop.

## TASK-022 - Formulário de análise jurídica

### Diagnóstico

O formulário já possuía campos essenciais, LGPD obrigatória e envio para a API de oportunidades. Nesta entrega, o foco foi garantir que o formulário não fique como card flutuante fora da tela no mobile.

### Arquivos alterados

- `frontend/src/app/globals.css`

### Implementação

- Mantidas regras para o card do formulário virar bloco normal no mobile.
- Inputs, selects, textarea e botão preservam altura mínima adequada para toque.
- Dados preenchidos continuam preservados em erro.

### Critérios de aceite

- [x] Formulário permanece utilizável com uma mão.
- [x] Consentimento LGPD continua obrigatório.
- [x] Loading e sucesso permanecem implementados.

## Validações executadas

- `npm run lint`: passou.
- `npm run build`: passou.

Observação: durante o build, o Next registrou `fetch failed` ao coletar páginas que consultam backend local indisponível, mas o build terminou com sucesso. O aviso de root do Turbopack por lockfile externo permanece.

## Evidências

- Landing afetada: `/`.
- Menu mobile: componente `Drawer` da Fase 1 conectado ao header da landing.
- Screenshots automáticos: pendentes até configurar Playwright ou ferramenta equivalente.

## Pendências da Fase 2

- TASK-023 a TASK-036 ainda pendentes.
- Refatorar áreas de atuação para cards totalmente clicáveis e rotas com metadata.
- Melhorar demonstração da Área do Cliente com modal/bottom sheet de vídeo ou demo.
- Implementar CTA fixo mobile com lógica para não cobrir formulário.
- Consolidar SEO, schemas, sitemap, robots e analytics da landing.
