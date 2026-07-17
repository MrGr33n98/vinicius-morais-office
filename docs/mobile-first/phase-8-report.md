# Fase 8 - Performance e Qualidade

Data: 2026-07-17

## Escopo desta entrega

Primeiro bloco da Fase 8, focado em qualidade de build, configuracao de producao do frontend e auditoria inicial de assets.

## TASK-130/TASK-131 - Imagens e fontes

### Diagnostico

O diretorio `frontend/public` ja possui imagens WebP para os principais assets da landing e do portal. O peso total atual dos assets publicos esta em torno de 2,6 MB, com imagens principais abaixo de 400 KB.

### Resultado

- Mantidas as versoes WebP ja utilizadas nos componentes principais.
- Nenhuma nova biblioteca de imagem foi adicionada.
- Nenhum asset pesado novo foi introduzido.

### Pendencia

- Converter ou remover os pares JPG quando a equipe confirmar que nao sao mais usados diretamente.
- Migrar fonte externa `@import` para `next/font` em um bloco futuro para reduzir dependencia de CSS remoto.

## TASK-132/TASK-133 - Bundle e configuracao Next

### Diagnostico

O build exibia aviso de raiz incorreta do Turbopack porque o Next detectava um lockfile em `C:\Users\Bobi\pnpm-lock.yaml` e assumia uma raiz acima do projeto.

### Arquivos alterados

- `frontend/next.config.mjs`

### Implementacao

- Configurado `turbopack.root` apontando explicitamente para a pasta `frontend`.
- Habilitado `compress`.
- Desabilitado `poweredByHeader` para reduzir exposicao desnecessaria de tecnologia.

### Criterios de aceite

- [x] Warning de raiz do Turbopack removido.
- [x] Build de producao continua passando.
- [x] Sem alteracao de rotas ou contratos de API.
- [x] Sem nova dependencia.

## TASK-134/TASK-135 - Cache, revalidacao e queries duplicadas

### Diagnostico

As rotas publicas de blog e glossario estavam marcadas como `force-dynamic`, apesar de tambem declararem `revalidate`. Isso impedia que elas se comportassem como paginas ISR previsiveis e ainda gerava tentativas ruidosas de fetch durante o build quando o backend local estava indisponivel.

### Arquivos alterados

- `frontend/src/app/blog/page.js`
- `frontend/src/app/blog/[slug]/page.js`
- `frontend/src/app/glossario/page.js`
- `frontend/src/app/glossario/[slug]/page.js`
- `frontend/src/lib/public-api.js`

### Implementacao

- Criado helper `fetchPublicJson` para centralizar chamadas publicas server-side.
- Criado `normalizeCollection` compartilhado para os formatos aceitos pela API.
- Removido `force-dynamic` de blog e glossario para permitir ISR.
- Detalhes de artigo e termo usam `cache()` do React para deduplicar chamadas entre metadata e pagina.
- Durante `npm run build`, fetch publico e pulado por padrao para evitar falhas quando a API nao esta disponivel no momento da compilacao.
- `NEXT_PUBLIC_BUILD_FETCH=true` pode reativar fetch em build quando a API estiver acessivel.
- Links internos de blog e glossario passaram a usar `next/link`.

### Criterios de aceite

- [x] `/blog` aparece como rota estatica com revalidacao de 1 minuto.
- [x] `/glossario` aparece como rota estatica com revalidacao de 1 hora.
- [x] Build nao registra mais `fetch failed` quando backend local esta offline.
- [x] Rotas de detalhe preservam `generateStaticParams`.
- [x] Sem alteracao de contrato com a API.

## Validacoes executadas

- `git diff --check`: passou.
- `npm run lint`: passou.
- `npm run build`: passou.

Observacao: o build agora conclui sem o aviso de raiz do Turbopack e sem logs de `fetch failed`. As rotas publicas de conteudo aparecem como estaticas/ISR na tabela final do Next.

## Pendencias da Fase 8

- TASK-136 auditoria Lighthouse.
- TASK-137 auditoria WCAG.
- TASK-138 auditoria de seguranca frontend.
- TASK-139 auditoria de autorizacao backend.
- TASK-140 testes de responsividade com screenshots.
