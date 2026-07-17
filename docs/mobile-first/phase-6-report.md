# Fase 6 - Cronograma, Gantt e Kanban

Data: 2026-07-17

## Escopo desta entrega

Primeiro bloco da Fase 6, focado em melhorar a experiencia mobile do cronograma Gantt e do Kanban processual ja existentes, sem alterar contratos do backend.

## TASK-090/TASK-091/TASK-092 - Linha do tempo e Gantt responsivo

### Diagnostico

O Gantt ja possuia eixo temporal, fases, zoom, legenda e marcador "Hoje", mas no mobile dependia quase totalmente de rolagem horizontal.

### Arquivos alterados

- `frontend/src/app/portal/page.js`
- `frontend/src/app/globals.css`

### Implementacao

- Criada linha do tempo resumida mobile antes do Gantt horizontal.
- Cada fase mobile mostra status, titulo, percentual, datas e responsavel.
- Tocar em uma fase abre o painel de detalhes.
- Mantido o Gantt horizontal para quem quiser comparar escala temporal.

### Criterios de aceite

- [x] Mobile possui leitura vertical antes da rolagem horizontal.
- [x] Barras do Gantt desktop foram preservadas.
- [x] Status aparece com texto e contexto, nao apenas cor.
- [x] Fases abrem detalhe.

## TASK-093/TASK-094/TASK-099 - Hoje, zoom e exportacao

### Diagnostico

O zoom existia, mas faltavam atalhos explicitos para voltar ao periodo atual e exportar.

### Implementacao

- Adicionado botao "Ir para hoje", que muda para a escala mensal centrada no periodo atual.
- Adicionado botao "Exportar", usando impressao do navegador como fallback simples.
- Mantidos zoom por mes, trimestre e processo completo.

### Criterios de aceite

- [x] Controles possuem area clicavel adequada no mobile.
- [x] Zoom continua local e sem persistencia enganosa.
- [x] Exportacao nao altera dados.

## TASK-095 - Detalhe em bottom sheet mobile

### Diagnostico

O detalhe de Gantt/Kanban era painel lateral. Em mobile, isso ocupava espaco e empurrava a leitura.

### Implementacao

- O painel de detalhe passa a se comportar como bottom sheet em telas pequenas.
- Header do detalhe fica fixo dentro do painel.
- Conteudo permanece rolavel e respeita safe area inferior.

### Criterios de aceite

- [x] Mobile nao empilha painel lateral no meio do fluxo.
- [x] Fechamento continua disponivel.
- [x] Desktop preserva painel lateral/sticky.

## TASK-096/TASK-097/TASK-098 - Kanban somente leitura e filtros

### Diagnostico

O Kanban ja era somente leitura e possuia filtros, mas no mobile o carrossel com seis colunas ainda podia gerar orientacao ruim.

### Implementacao

- Adicionado seletor mobile de coluna com contadores.
- Opcao "Todas" preserva o carrossel completo.
- Selecionar coluna foca apenas na coluna escolhida no mobile.
- Desktop continua exibindo o quadro completo.

### Criterios de aceite

- [x] Cliente nao possui drag-and-drop.
- [x] Colunas continuam sincronizadas com os dados carregados.
- [x] Cards abrem painel de detalhes.
- [x] Mobile funciona como carrossel ou coluna unica selecionada.

## Validacoes executadas

- `npm run lint`: passou.
- `npm run build`: passou.

Observacao: durante o build, o Next registrou `fetch failed` ao coletar paginas que consultam backend local indisponivel, mas o build terminou com sucesso. O aviso de root do Turbopack por lockfile externo permanece.

## Pendencias da Fase 6

- Exportacao real em imagem/PDF ainda depende de decisao de biblioteca ou endpoint.
- Testes E2E do cronograma ainda pendentes.
- Filtros server-side dependem de endpoint granular futuro.
