# Fase 5 - Modulos Processuais

Data: 2026-07-17

## Escopo desta entrega

Primeiro bloco da Fase 5, focado em tornar Andamentos, Prazos/Intimacoes e Documentos mais utilizaveis no mobile, sem alterar contratos do backend.

## TASK-070/TASK-071 - Andamentos

### Diagnostico

A timeline de andamentos ja existia e usava dados reais do processo, mas no mobile exigia leitura em formato muito proximo do desktop.

### Arquivos alterados

- `frontend/src/app/portal/page.js`
- `frontend/src/app/globals.css`

### Implementacao

- Criado resumo superior com quantidade de movimentacoes, ultima atualizacao e documentos vinculados.
- Criados cards mobile para cada andamento.
- Mantida a timeline desktop existente.
- Adicionado CTA textual "Explicar este andamento" como ponto de entrada para explicacao em linguagem simples.

### Criterios de aceite

- [x] Timeline desktop preservada.
- [x] Mobile usa cards legiveis em 320px.
- [x] Status/tipo aparecem como texto, nao apenas cor.
- [x] Estado vazio orienta quando nao houver andamento.

## TASK-072/TASK-073 - Prazos e Intimacoes

### Diagnostico

Prazos e intimacoes eram exibidos em timeline simples e sem filtros rapidos.

### Implementacao

- Adicionados filtros por Todos, Prazos e Intimacoes.
- Criados cards mobile com tipo, titulo, descricao, situacao, data e origem.
- Incluidas acoes "Abrir detalhe" e "Adicionar ao calendario".
- Mantida a timeline desktop existente.

### Criterios de aceite

- [x] Filtro nao altera os dados originais.
- [x] Estado vazio orienta ajuste de filtro.
- [x] Situacao do prazo aparece por texto.
- [x] Mobile nao depende de tabela larga.

## TASK-078/TASK-080 - Documentos e visualizador

### Diagnostico

Documentos tinham tabela desktop, pastas e resumo, mas no mobile a tabela gerava leitura ruim.

### Implementacao

- Adicionada busca por nome, tipo, formato e data.
- Criada lista mobile de documentos em cards.
- Adicionado painel de visualizacao com detalhes do documento selecionado.
- Mantidas pastas, filtros, resumo e tabela desktop.

### Criterios de aceite

- [x] Busca funciona sobre dados reais ja carregados.
- [x] Mobile usa cards com botoes de visualizar e baixar.
- [x] Estado vazio diferencia ausencia de resultado.
- [x] Desktop preserva tabela e paineis existentes.

## TASK-075/TASK-076/TASK-077 - Audiencias, calendario e checklist

### Diagnostico

Audiencias ja tinham proximas audiencias, calendario, historico, participantes e checklist, mas a experiencia mobile ainda dependia de blocos laterais e tabela.

### Implementacao

- Criados cards mobile de proximas audiencias com data, status, local, horario e acoes.
- Checklist ganhou itens com checkbox somente leitura, label textual e status.
- Historico de audiencias ganhou cards mobile com resultado, presenca e acao para baixar ata.
- Calendario e tabela desktop permanecem preservados para telas maiores.

### Criterios de aceite

- [x] Mobile prioriza agenda em formato de lista.
- [x] Checklist nao simula edicao persistida no portal do cliente.
- [x] Status aparece por texto, nao apenas cor.
- [x] Desktop preserva calendario e tabela.

## TASK-081/TASK-082 - Recursos, peticoes e detalhes

### Diagnostico

Recursos e peticoes eram exibidos em tabela. Para mobile, a leitura de status, responsavel e ultima manifestacao precisava virar card.

### Implementacao

- Criados cards mobile de pecas processuais.
- Cada card exibe tipo, protocolo, responsavel, situacao e ultima manifestacao.
- Adicionadas acoes de consulta: ver detalhes e baixar peca.
- Mantidos indicadores e tabela desktop.

### Criterios de aceite

- [x] Portal do cliente continua somente leitura.
- [x] Status possui badge textual.
- [x] Mobile nao depende de tabela larga.
- [x] Desktop preserva tabela e paineis existentes.

## Validacoes executadas

- `npm run lint`: passou.
- `npm run build`: passou.

Observacao: durante o build, o Next registrou `fetch failed` ao coletar paginas que consultam backend local indisponivel, mas o build terminou com sucesso. O aviso de root do Turbopack por lockfile externo permanece.

## Pendencias da Fase 5

- TASK-074 lembretes autoritativos dependem de backend.
- TASK-079 upload real precisa endpoint/contrato seguro de upload.
- TASK-083 testes integrados dos modulos pendente.
