# Fase 4 - Dashboard e Processos

Data: 2026-07-17

## Escopo desta entrega

Primeiro bloco da Fase 4, focado no dashboard mobile e na listagem de processos em formato de cards, mantendo a tabela desktop existente.

## TASK-050 - Dashboard mobile

### Diagnostico

O dashboard ja exibia estatisticas, processos, prazos, documentos e mensagens, mas a primeira leitura no mobile ainda era muito parecida com desktop. A especificacao pede saudacao, resumo, proximo prazo e processos em ordem prioritaria.

### Arquivos alterados

- `frontend/src/app/portal/page.js`
- `frontend/src/app/globals.css`

### Implementacao

- Saudacao personalizada no topo do dashboard.
- Texto introdutor mais direto para mobile.
- Card de "Proximo prazo" logo apos os cards de resumo.
- Grids principais do dashboard passam a empilhar corretamente no mobile.

### Criterios de aceite

- [x] Conteudo prioritario aparece antes dos blocos secundarios.
- [x] Proximo prazo possui titulo, descricao, data e acao.
- [x] Desktop preserva layout em grade.

## TASK-051 - Cards de resumo

### Diagnostico

Os cards de resumo ja existiam e consumiam dados reais da API do portal.

### Implementacao

- Mantidos os cards existentes conectados aos dados reais.
- Ajustado contexto visual ao redor dos cards com saudacao e proximo prazo.
- Preservada formatacao existente de valores e indicadores.

### Criterios de aceite

- [x] Nenhum card sem funcao foi criado.
- [x] Dados continuam vindo de `clientData.stats`.
- [x] Mobile usa uma coluna quando necessario.

## TASK-057/TASK-059 - Listagem e card de processo

### Diagnostico

A lista de processos era exibida como tabela. Isso funciona no desktop, mas no mobile aumenta o risco de leitura ruim e scroll horizontal.

### Arquivos alterados

- `frontend/src/app/portal/page.js`
- `frontend/src/app/globals.css`

### Implementacao

- Mantida a tabela desktop.
- Criada lista mobile em cards para os processos.
- Cada card mostra titulo, CNJ, vara/tribunal, fase atual, status e ultima atualizacao.
- Card inteiro abre a visao do processo.
- Estado vazio orienta quando nao houver processo vinculado.

### Criterios de aceite

- [x] Tabela desktop preservada.
- [x] Mobile usa cards tocaveis.
- [x] Card inteiro e clicavel.
- [x] Status nao depende apenas de cor, pois usa badge textual.
- [x] Estado vazio implementado.

## Validacoes executadas

- `npm run lint`: passou.
- `npm run build`: passou.

Observacao: durante o build, o Next registrou `fetch failed` ao coletar paginas que consultam backend local indisponivel, mas o build terminou com sucesso. O aviso de root do Turbopack por lockfile externo permanece.

## Pendencias da Fase 4

- TASK-052 a TASK-056 ainda precisam ser refinadas em componentes dedicados.
- TASK-058 busca e filtros da listagem de processos ainda pendente.
- TASK-060/TASK-061/TASK-062 visao geral do processo, tabs internas e proxima acao ainda precisam de uma segunda passada mobile-first.
- TASK-063 testes E2E de processos pendente.
