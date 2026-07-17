# Fase 4 - Dashboard e Processos

Data: 2026-07-17

## Escopo desta entrega

Primeiro e segundo blocos da Fase 4, focados no dashboard mobile, listagem filtravel de processos e segunda passada da visao geral do processo, mantendo o desktop existente.

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

## TASK-052 a TASK-056 - Blocos dedicados do dashboard

### Diagnostico

Prazos, documentos, mensagens e financeiro existiam no dashboard, mas ainda ficavam mais baixos na hierarquia e sem atalhos claros no mobile.

### Implementacao

- Cards de resumo passaram a ser acionaveis.
- Criado bloco prioritario com documento recente, mensagem recente e financeiro.
- Cada card abre o modulo correspondente usando os dados ja carregados da API agregada.
- Mantida a ordem mobile: saudacao, resumo, proximo prazo, atalhos operacionais e processos.

### Criterios de aceite

- [x] Cards prioritarios possuem funcao.
- [x] Valores continuam vindo de `clientData`.
- [x] Mobile empilha os blocos sem scroll horizontal acidental.

## TASK-058 - Busca e filtros de processos

### Diagnostico

A listagem mobile em cards nao tinha busca ou filtros, exigindo leitura manual dos processos.

### Implementacao

- Adicionada busca por titulo, CNJ, vara, fase, status e ultima atualizacao.
- Adicionados filtros por status e fase atual.
- Chips indicam filtros ativos e quantidade de resultados.
- Estado vazio especifico orienta remover ou ajustar filtros.

### Criterios de aceite

- [x] Busca nao altera dados originais.
- [x] Filtros funcionam sobre os dados reais carregados do portal.
- [x] Estados vazios diferenciam "sem processo" de "sem resultado".

## TASK-060/TASK-061/TASK-062 - Visao geral do processo

### Diagnostico

A visao geral tinha dados importantes, mas a proxima acao e os atalhos ficavam diluidos em paineis laterais, especialmente no mobile.

### Implementacao

- Criado painel prioritario de proxima acao no topo da visao geral.
- Criado conjunto de acoes rapidas: prazo, documentos e falar com advogado.
- Criado resumo clicavel com fase atual, ultimo andamento, documentos e audiencias.
- Mantidos dados tecnicos, ultimos andamentos, cronograma e painel lateral para desktop.

### Criterios de aceite

- [x] Proxima acao aparece antes dos dados tecnicos.
- [x] Tabs internas seguem acessiveis por botoes.
- [x] Cards de resumo abrem os modulos relacionados.

## Validacoes executadas

- `npm run lint`: passou.
- `npm run build`: passou.

Observacao: durante o build, o Next registrou `fetch failed` ao coletar paginas que consultam backend local indisponivel, mas o build terminou com sucesso. O aviso de root do Turbopack por lockfile externo permanece.

## Pendencias da Fase 4

- TASK-063 testes E2E de processos pendente.
