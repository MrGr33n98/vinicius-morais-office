# Fase 7 - Comunicacao, Financeiro e Conta

Data: 2026-07-17

## Escopo desta entrega

Fase 7 em dois blocos: comunicacao/financeiro e conta/configuracoes/ajuda mobile first.

## TASK-110/TASK-111/TASK-112 - Mensagens, thread e composer

### Diagnostico

A central de comunicacao ja consumia dados reais, permitia alternar conversas e enviar mensagens pelo endpoint existente. No mobile, o cabecalho, indicadores e composer ainda precisavam de uma leitura mais clara.

### Arquivos alterados

- `frontend/src/app/portal/page.js`
- `frontend/src/app/globals.css`

### Implementacao

- Cabecalho da comunicacao ganhou estrutura responsiva.
- Indicadores de nao lidas, conversas e mensagens passam a formar grid no mobile.
- Adicionado aviso de sigilo e uso adequado do canal.
- Composer recebeu texto auxiliar contra envio indevido de informacoes sensiveis.
- Mantido envio real de mensagens pelo endpoint `POST /api/v1/portal_messages`.

### Criterios de aceite

- [x] Mobile nao depende de tres colunas simultaneas para contexto principal.
- [x] Composer preserva envio existente.
- [x] Aviso nao exibe dados sensiveis.
- [x] Desktop preserva a estrutura atual.

## TASK-113/TASK-114 - Financeiro e faturas

### Diagnostico

O financeiro ja tinha resumo, grafico, lancamentos e documentos financeiros, mas a tabela de lancamentos era pouco amigavel no mobile.

### Implementacao

- Resumo financeiro passa a empilhar no mobile.
- Lancamentos ganharam cards mobile com data, descricao, categoria, tipo e valor.
- Cards diferenciam visualmente entrada e despesa sem depender apenas de cor.
- Tabela desktop foi preservada para telas maiores.

### Criterios de aceite

- [x] Valores financeiros continuam vindo de `matter.financeiro`.
- [x] Mobile nao depende de tabela larga.
- [x] Acoes de comprovante/detalhes ficam com area clicavel adequada.
- [x] Desktop preserva tabela e paineis atuais.

## TASK-115/TASK-116 - Perfil e seguranca da conta

### Diagnostico

O perfil ja persistia dados reais via `PATCH /api/v1/portal_profile`, mas o layout usava grids fixos que ficavam apertados no mobile e nao explicava bem seguranca, consentimentos e canais de contato.

### Implementacao

- Formulario de perfil ganhou classes responsivas sem alterar o contrato da API.
- Grids de acesso, dados cadastrais, endereco e preferencias passam para uma coluna no mobile.
- Botao de salvar ocupa largura total em telas pequenas.
- Card lateral recebeu resumo de senha, sessao e LGPD.
- Adicionada secao de seguranca e privacidade com orientacao sobre senha, canais de aviso e tratamento de dados.

### Criterios de aceite

- [x] Persistencia existente foi preservada.
- [x] Campos mantem area minima de toque no mobile.
- [x] Preferencias seguem salvando no backend.
- [x] Dados sensiveis nao foram expostos alem do que ja aparece no perfil.

## TASK-117/TASK-118/TASK-119 - Configuracoes, preferencias e ajuda

### Diagnostico

Abas auxiliares como atendimentos, notificacoes, compromissos e tarefas exibiam um estado generico de "em breve", sem orientar o cliente ou oferecer caminho de suporte.

### Implementacao

- Fallback do portal foi trocado por um estado util com status atual.
- Adicionados CTAs para falar com a equipe e revisar preferencias.
- FAQ simples orienta notificacoes, envio de documentos e uso correto de mensagens.
- O componente respeita mobile first e evita scroll horizontal.

### Criterios de aceite

- [x] Nenhuma rota auxiliar fica sem proxima acao clara.
- [x] FAQ usa HTML nativo com `details` e `summary`.
- [x] CTAs levam para telas reais ja existentes.
- [x] Sem novos mocks persistentes ou alteracao de API.

## Validacoes executadas

- `git diff --check`: passou.
- `npm run lint`: passou.
- `npm run build`: passou.

Observacao: durante o build, o Next registrou `fetch failed` ao coletar paginas que consultam backend local indisponivel, mas o build terminou com sucesso. O aviso de root do Turbopack por lockfile externo permanece.

## Pendencias da Fase 7

- TASK-120 testes E2E ainda pendentes.
