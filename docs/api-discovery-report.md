# Discovery Report - Public APIs for Legal Tech SaaS

Data: 2026-07-17

## Executive Summary

The platform can build a strong MVP around public judicial movements, firm-owned matter data, notifications, and client-friendly explanations. DataJud is suitable for process lookup, movement ingestion, party metadata, timeline generation, deduplication, and basic status indicators. It is not sufficient by itself for full legal documents, private/sealed cases, guaranteed hearing extraction, judicial deadline calculation, or reliable court-average benchmarking.

The best immediate architecture is:

- Use DataJud as an external source of truth for public process metadata and movements.
- Store normalized raw payloads and derived client-facing records.
- Treat all client-facing explanations, health indicators, and hearing dates as interpreted data with confidence levels.
- Cache OpenAI translations/summaries by movement fingerprint to control cost.
- Send notifications only after backend authorization, deduplication, and privacy filtering.

Important note: the prompt describes REST endpoints such as `/api/public/v1/processes`. The current public CNJ wiki also documents DataJud access through tribunal aliases and search endpoints backed by Elasticsearch. Implementation should verify the exact production contract before coding.

Sources consulted:

- CNJ DataJud public API: https://datajud-wiki.cnj.jus.br/api-publica/
- ReceitaWS: https://www.receitaws.com.br/
- BrasilAPI: https://brasilapi.com.br/docs
- ViaCEP: https://viacep.com.br/
- Twilio WhatsApp pricing: https://www.twilio.com/en-us/whatsapp/pricing
- OpenAI API pricing: https://openai.com/api/pricing/
- Google Calendar API usage limits: https://developers.google.com/calendar/api/guides/quota
- iCalendar format RFC 5545: https://www.rfc-editor.org/rfc/rfc5545

---

## 1. DataJud API (CNJ)

### 1.1 Access Model

Given contract:

- Authentication: `Authorization: ApiKey <key>`.
- Keys obtained through gov.br.
- Rate limit: 500 requests/minute per key.
- Main endpoints:
  - Search: `GET /api/public/v1/processes?numeroProcesso=XXXX&page=0&size=10`
  - Detail: `GET /api/public/v1/processes/{datajud_id}`
  - Movements: `GET /api/public/v1/processes/{datajud_id}/movements?page=0&size=100`
  - Parties: `GET /api/public/v1/processes/{datajud_id}/parties?page=0&size=100`

Current CNJ wiki caution:

- The public wiki currently shows `Authorization: APIKey [Chave Pública]`.
- It also documents tribunal-specific aliases and query examples closer to Elasticsearch search.
- Before implementation, create a small spike to confirm the exact deployed endpoints available for our API key.

### 1.2 Supported Features

| Feature | DataJud Support | Notes |
|---|---:|---|
| Process lookup by CNJ number | Strong | Good fit for onboarding matters and linking local `matters.court_number`. |
| Timeline of movements | Strong | Movements can populate chronological process history. |
| Deduplication | Strong if movement `id` is stable | Store DataJud movement ID with unique index per matter/source. |
| Party list | Medium | Individuals may be masked. Useful for role labels, not full CRM enrichment. |
| Notifications for new movements | Strong | Compare latest synced movement IDs/timestamps and notify authorized clients. |
| Basic process health | Medium | Can derive recency, inactivity, suspended terms, current phase hints. Must be probabilistic. |
| Hearing extraction | Yellow | Possible from `descricao` and `complementosTabelados`, but not guaranteed. Needs confidence score and manual override. |
| Calendar events | Yellow | Use extracted hearing/date movements plus firm-entered `meetings`. Never rely only on extracted text. |
| Publications | Medium | Some publication-like movements may appear, but official diário/publication integrations may be richer. |
| Full decision text | Weak | DataJud movements often describe events, not necessarily full document content. |
| Non-public/sealed processes | Weak/none | Public API should not be expected to expose confidential records. |

### 1.3 Movement Data Reliability

Movement object from prompt:

- `id`
- `dataHora`
- `descricao`
- `complementosTabelados`: array of `{ tipo, nome, valor }`

Assessment:

- `id`: best deduplication key if globally stable. Store as `source_movement_id`.
- `dataHora`: authoritative timestamp for ordering, but timezone normalization is required.
- `descricao`: useful for display and classification, but court systems may vary in wording, completeness, abbreviations, and grammar.
- `complementosTabelados`: most valuable field for structured interpretation. Use it before regex against `descricao`.

Hearing extraction:

- Reliable only when complements contain structured date/time/type.
- Less reliable when date appears inside free text.
- Should produce:
  - `detected_event_type`
  - `detected_starts_at`
  - `confidence`
  - `source = datajud_movement`
  - `requires_review` when confidence is low.

Recommendation:

- Never promise hearing dates solely from automated extraction.
- Firm staff should be able to confirm, edit, or discard extracted hearings.

### 1.4 Missing Information and Workarounds

| Missing / Limited Data | Impact | Workaround |
|---|---|---|
| Full text of decisions and petitions | Client cannot see full legal document from DataJud alone. | Store documents uploaded by firm in `documents`; integrate court document APIs later if legally available. |
| Private/sealed process data | Cannot support complete visibility for confidential cases. | Allow manual matter records and firm-managed timeline. |
| Accurate procedural deadlines | DataJud movements are not enough to compute all legal deadlines. | Store deadlines as firm-authored records; treat extracted dates as suggestions. |
| Complete party personal data | Masked CPF/name for individuals. | Use local client onboarding, not DataJud, for full client profile. |
| Court average benchmarks | DataJud can be queried, but benchmarking requires large historical dataset and normalization. | Build later with aggregated sync and statistical methodology. |
| Document attachments | Usually absent from movement feed. | Use Active Storage and firm uploads. |

### 1.5 Efficient Sync Strategy

Rate limit: 500 requests/min/key.

Principles:

- Sync per firm with firm-owned DataJud key when available.
- Queue sync jobs by firm to avoid one firm consuming another firm’s quota.
- Use incremental sync whenever possible.
- Store raw payloads for audit and future reprocessing.

Recommended schedule:

| Matter Status | Sync Frequency | Rationale |
|---|---:|---|
| Active with upcoming deadline/hearing | Every 2-4 hours | High client value. |
| Active normal | 1-2 times/day | Good balance under rate limits. |
| Suspended | Daily or every 2 days | Lower movement frequency. |
| Archived/closed | Weekly or on-demand | Avoid wasted quota. |
| Recently created/imported | Immediate on-demand sync | Fast onboarding feedback. |

Pagination:

- Search by CNJ number: expect small result set, but still handle pagination.
- Movements: request `size=100`, loop pages until fewer than `size` returned.
- Parties: same approach.
- Store `last_synced_at`, `last_successful_sync_at`, `last_movement_at`, and `sync_cursor` if the API supports cursoring.

Deduplication:

- Primary dedup key: `[firm_id, matter_id, source, source_movement_id]`.
- Fallback key if movement ID is missing: hash of `[dataHora, descricao, complementosTabelados]`.
- Keep raw JSON and normalized fields.
- If a movement with same ID changes, update normalized fields and preserve version/audit trail.

Failure handling:

- 401/403: disable key and notify firm admin.
- 429: exponential backoff, pause firm queue.
- 5xx/network: retry with jitter.
- Malformed payload: store sync error and raw sample for investigation.

### 1.6 Data Mapping

The current schema has `matters`, `matter_events`, `notifications`, `documents`, `publications`, and related client tables. For a production-quality integration, add dedicated normalized tables rather than overloading `matter_events`.

Suggested model mapping:

| DataJud Field | Target Table | Target Field |
|---|---|---|
| process `id` | `process_data` | `datajud_id` |
| CNJ number | `matters` / `process_data` | `court_number` / `numero_processo` |
| tribunal/class/subject | `process_data` | `court_code`, `process_class`, `subjects` |
| process raw JSON | `process_data` | `raw_payload` |
| movement `id` | `process_movements` | `source_movement_id` |
| movement `dataHora` | `process_movements` | `occurred_at` |
| movement `descricao` | `process_movements` | `description` |
| movement complements | `process_movements` | `complements_json` |
| movement raw JSON | `process_movements` | `raw_payload` |
| party `tipoParticipacao` | `process_parties` | `participation_type` |
| party `nome` | `process_parties` | `name_masked` |
| party `documento` | `process_parties` | `document_masked` |
| publication-like movement | `publications` | `content`, `published_at`, `matter_id` |
| client-facing timeline | `matter_events` | `event_type`, `description`, `happened_at`, `metadata` |

Recommended new tables:

- `process_data`
- `process_movements`
- `process_parties`
- `process_sync_runs`
- `process_movement_translations`
- `public_access_links`

---

## 2. Other Free APIs for Enrichment and Communication

### 2.1 ReceitaWS (CNPJ)

Typical endpoint:

- `GET https://www.receitaws.com.br/v1/cnpj/{cnpj}`

Commonly available data:

- Legal name.
- Trade name.
- Opening date.
- Status.
- CNAE principal and secondary activities.
- Address.
- Phone/email when available.
- Legal nature.
- QSA/partners, depending on plan/data availability.

Free-tier caution:

- ReceitaWS historically has a strict public/free limit, often cited as around 3 requests/minute.
- Commercial plans provide higher limits and tokens.
- Verify current terms before production usage.

Feasibility:

- Good for onboarding corporate clients.
- Use as enrichment, not as source of authorization.

LGPD:

- CNPJ data is company data, but partner names can be personal data.
- Store only fields needed for legal service.
- Record source and timestamp.
- Do not expose partner names in client portal unless necessary and authorized.

### 2.2 BrasilAPI (CNPJ, CEP)

Typical endpoints:

- `GET https://brasilapi.com.br/api/cnpj/v1/{cnpj}`
- `GET https://brasilapi.com.br/api/cep/v2/{cep}`

Available data:

- CNPJ registration data.
- Company name, trade name, status.
- Address.
- CNAE.
- QSA/partners where available.
- CEP address lookup.

Feasibility:

- Very good for Rails onboarding flows because it requires no key for many endpoints.
- Good fallback or primary free integration for CNPJ and CEP.

Limits:

- Public service without key, but production systems should implement caching, timeout, and backoff.
- Do not treat it as unlimited infrastructure.

LGPD:

- Same caution as ReceitaWS.
- Cache minimal fields.
- Avoid unnecessary partner data exposure.

### 2.3 ViaCEP

Typical endpoint:

- `GET https://viacep.com.br/ws/{cep}/json/`

Available data:

- Street.
- Neighborhood.
- City.
- State.
- IBGE code.
- DDD and SIAFI fields in many responses.

Feasibility:

- Immediate and simple.
- Excellent for filling client profile address.
- No key required.

Limitations:

- No personal identity data.
- Address may be generic for some CEPs.

LGPD:

- CEP alone can be personal data when combined with client identity.
- Store as part of client profile with normal access controls.

### 2.4 Twilio WhatsApp

Capabilities:

- WhatsApp Business messaging.
- Templates for outbound notifications.
- Session messages after user replies.
- Delivery status webhooks.

Free tier:

- Twilio often provides trial credits, but production WhatsApp messaging is paid.
- Meta/WhatsApp conversation or per-message pricing varies by country/category.
- Twilio also charges platform fees depending on pricing model.

Feasibility:

- Good for proactive notifications after MVP.
- Requires template approval and careful content design.

Privacy:

- Do not include full process number, sensitive party names, financial details, or document titles in WhatsApp body.
- Send minimal notification: “Há uma nova atualização no seu portal.”
- Link to authenticated portal.

### 2.5 OpenAI API

Best uses:

- Plain-language translation of judicial movements.
- Short Q&A over already authorized process context.
- Summaries of movement history.
- Classification of movement type and urgency as assistive metadata.

Model choice:

- For translation and simple Q&A, use a small/mini model for cost and latency.
- Use a stronger model only for complex legal summarization or reasoning-heavy tasks.
- Cache all generated explanations by movement fingerprint.

Cost estimate:

- A short sentence translation is usually a fraction of a cent with small models.
- Actual cost depends on current token pricing and prompt size.
- The expensive part is not one sentence; it is repeated translation without caching.

LGPD:

- Avoid sending full names, CPF, financial data, or private documents unless contractually approved.
- Prefer redaction before LLM calls.
- Store prompt/output audit metadata without sensitive raw prompt when possible.
- Label outputs as informational, not legal advice.

### 2.6 Google Calendar / iCal

Options:

- Generate `.ics` files server-side using iCalendar format. This is free and does not require Google API.
- Google Calendar API can push events into a user calendar, but requires OAuth, scopes, consent screen, and quota management.

Recommendation:

- MVP: generate downloadable `.ics` files for hearings/deadlines confirmed by firm.
- Later: Google Calendar OAuth integration for clients who opt in.

LGPD:

- ICS files may leak event title/location if forwarded.
- Use neutral titles like “Compromisso jurídico” and put sensitive details behind portal login.

---

## 3. Feature Feasibility Matrix

| Feature | Rating | API Dependencies | Gaps / Risks | Recommendation |
|---|---|---|---|---|
| a) Timeline with plain-language translations | Green | DataJud movements + OpenAI | Movement text quality varies. | Build immediately with cached explanations and disclaimer. |
| b) Proactive WhatsApp/email notifications | Green | DataJud sync + email provider + Twilio/WhatsApp | Template approval, LGPD-safe message content. | Build after sync dedup is reliable. |
| c) Temporary public access links | Green | Internal Rails only | Security risk if token leaks. | Build with signed tokens, expiry, audit logs, limited scope. |
| d) PDF certificate of movements | Green | Internal DB + PDF gem | Must distinguish official court cert vs platform report. | Call it “relatório de acompanhamento”, not official certificate unless legally valid. |
| e) Process health indicator | Yellow | DataJud + local deadlines/tasks | Health is an interpretation, not official status. | Use transparent factors and confidence labels. |
| f) Calendar of upcoming hearings extracted from movements | Yellow | DataJud movements + NLP/rules + firm review | Extraction is incomplete and error-prone. | Use as suggestion, require confirmation for client-facing calendar. |
| g) Comparative report client vs court averages | Red/Yellow | Large DataJud historical dataset | Requires bulk analytics, normalization by class/court/phase. | Not MVP. Research methodology first. |
| h) Client chatbot QA over their processes | Yellow | Internal authorized data + OpenAI | Needs retrieval, redaction, guardrails, audit. | Phase 3 with strict scoping and disclaimers. |

---

## 4. Architecture and Data Flow

### 4.1 Multi-Tenancy

Current schema includes `firms`, `clients`, `matters`, and `users`.

Recommendations:

- Every external credential belongs to a `firm`.
- Use `Current.firm` in request context.
- Background jobs must explicitly set firm context from `firm_id`; never rely on thread state.
- Add `firm_id` to new sync-related tables where appropriate.
- Enforce authorization through Pundit/RBAC, not frontend visibility.

DataJud keys:

- Preferred: one DataJud API key per firm.
- Alternative MVP: platform-level key with per-firm internal quota, but this creates operational and legal coupling.

### 4.2 Sync Pipeline

High-level flow:

1. Matter created or court number updated.
2. Enqueue on-demand DataJud sync.
3. Search process by CNJ number.
4. Store/update `process_data`.
5. Fetch movements and parties paginated.
6. Upsert movement rows by DataJud movement ID.
7. Classify new movements.
8. Generate or fetch cached plain-language translation.
9. Create client-facing `matter_events`.
10. Create notifications if movement is relevant and user is subscribed.
11. Dispatch email/WhatsApp notification with privacy-safe content.

### 4.3 Jobs

Use either the project’s existing queue stack or Sidekiq. Given the schema mentions Solid Queue in logs, Solid Queue is acceptable if already adopted.

Recommended jobs:

- `Datajud::MatterSyncJob`
- `Datajud::FirmScheduledSyncJob`
- `Datajud::MovementClassificationJob`
- `Ai::MovementTranslationJob`
- `Notifications::MovementDigestJob`
- `Notifications::DispatchEmailJob`
- `Notifications::DispatchWhatsappJob`
- `PublicLinks::ExpireLinksJob`

Recurring jobs:

- Active matters sync.
- Suspended/archived matter sync.
- Retry failed syncs.
- Notification digest.
- Expire public links.

### 4.4 Caching OpenAI Translations

Cache key:

- `source = datajud`
- `movement_id`
- `description_hash`
- `prompt_version`
- `model`
- `language = pt-BR`

Why include prompt version:

- Allows future reprocessing when tone/format changes.

Storage:

- `process_movement_translations`
- fields: `movement_id`, `plain_text`, `summary`, `risk_label`, `prompt_version`, `model`, `input_tokens`, `output_tokens`, `created_at`.

Policy:

- Never translate the same unchanged movement twice.
- Batch low-priority translations.
- Translate on demand if client opens a matter and translation is missing.

### 4.5 Deduplication and Updates

Dedup:

- Unique by `[firm_id, matter_id, source, source_movement_id]`.
- If no external ID, use payload hash.

Updates:

- If same external ID returns different payload:
  - update normalized fields;
  - record previous payload hash;
  - optionally create version/audit event.

Notification safety:

- Notify only when a movement is newly inserted and classified as client-relevant.
- Do not re-notify on payload formatting changes unless semantic status changes.

### 4.6 Retries, Failures, Logging

Log each sync run:

- firm_id
- matter_id
- started_at
- finished_at
- status
- request count
- movements inserted/updated
- error class
- HTTP status
- retry count

Retry policy:

- 429: exponential backoff and pause firm queue.
- 401/403: mark credential invalid and alert admin.
- 404 process not found: mark as unresolved, allow manual review.
- 5xx/network: retry with jitter.

### 4.7 Security and LGPD

Public links:

- Use signed random tokens, not IDs.
- Scope token to one resource or limited bundle.
- Expire quickly.
- Allow revoke.
- Log access IP/user-agent/timestamp.
- Never expose documents unless explicitly included.

Notifications:

- Avoid full names, CPF/CNPJ, financial amounts, document titles, and full process number.
- Use neutral text:
  - “Há uma nova atualização disponível no portal.”
  - “Acesse sua Área do Cliente para ver detalhes.”

LLM:

- Redact personal identifiers before external calls where possible.
- Do not train on customer data.
- Store consent and processing basis.

---

## 5. Implementation Roadmap

### Phase 1 - MVP: Core Sync, Timeline, Health

Goal:

- Import public process data and show a simplified client timeline.

Required models:

- `process_data`
- `process_movements`
- `process_parties`
- `process_sync_runs`
- `process_movement_translations`

Required jobs:

- `Datajud::MatterSyncJob`
- `Datajud::FirmScheduledSyncJob`
- `Ai::MovementTranslationJob`

Required services:

- `Datajud::Client`
- `Datajud::ProcessMapper`
- `Datajud::MovementMapper`
- `Datajud::PartyMapper`
- `ProcessHealth::Calculator`
- `Ai::MovementTranslator`

External gems/services:

- HTTP client: Faraday or HTTParty.
- Queue: existing Solid Queue or Sidekiq.
- Redis if Sidekiq/rate limiting is used.
- OpenAI Ruby client.
- `rack-attack` for request protection if not already present.

Deliverables:

- Matter sync by CNJ number.
- Timeline from movements.
- Cached plain-language explanation.
- Basic health indicator with explanation.
- Admin visibility into sync status.

### Phase 2 - Notifications, Public Links, PDF Report

Goal:

- Proactive communication and secure sharing.

Required models:

- `public_access_links`
- `notification_deliveries`
- optional `notification_preferences`
- optional `movement_reports`

Required jobs:

- `Notifications::MovementDigestJob`
- `Notifications::DispatchEmailJob`
- `Notifications::DispatchWhatsappJob`
- `PublicLinks::ExpireLinksJob`
- `Reports::MovementPdfJob`

Required services:

- `Notifications::MovementNotifier`
- `Notifications::PrivacyFilter`
- `PublicLinks::TokenIssuer`
- `Reports::MovementReportBuilder`

External gems/services:

- Email provider already used by Rails or Postmark/SendGrid/Mailgun.
- Twilio WhatsApp for production WhatsApp.
- PDF generation: Grover, WickedPDF, Prawn, or HexaPDF.

Deliverables:

- Email notifications.
- WhatsApp notifications with safe templates.
- Temporary public access links.
- PDF movement report.
- Audit trail for accesses and deliveries.

### Phase 3 - Advanced Features

Goal:

- Higher intelligence and deeper client self-service.

Features:

- Hearing/date extraction pipeline.
- Firm-confirmed calendar events and `.ics` generation.
- Client chatbot over authorized process data.
- Comparative reports, if methodology and data volume support it.

Required models:

- `extracted_process_events`
- `calendar_events`
- `chatbot_sessions`
- `chatbot_messages`
- `court_benchmarks`

Required jobs:

- `Datajud::EventExtractionJob`
- `Calendar::IcsGenerationJob`
- `Ai::ProcessQaIndexJob`
- `Benchmarks::AggregationJob`

Required services:

- `ProcessEvents::Extractor`
- `ProcessEvents::ConfidenceScorer`
- `Calendar::IcsBuilder`
- `Ai::ProcessQaService`
- `Benchmarks::CourtAverageCalculator`

External gems/services:

- OpenAI embeddings/chat.
- Vector store: pgvector preferred if PostgreSQL is already central.
- iCalendar gem or custom RFC 5545 builder.
- Optional Google Calendar API integration later.

Deliverables:

- Confirmed calendar events.
- Downloadable ICS.
- Controlled chatbot with citations to movements/documents.
- Experimental benchmark dashboard for internal use before client release.

---

## Final Recommendation

Start with DataJud sync and a trustworthy client timeline. Avoid overpromising automation around deadlines, hearings, or health until there is enough structured data and human review. The strongest client value comes from:

- “What happened?”
- “What does it mean in plain Portuguese?”
- “Do I need to do anything?”
- “Where can I see the document or talk to the team?”

Those are achievable immediately with DataJud, our current schema, careful normalization, and privacy-safe notifications.
