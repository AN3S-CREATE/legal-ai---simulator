# GeoLogix-Legal-AI — Master Complete Pack

This master document is a single-file archive of the repository's key text assets.
It exists for hand-in, review, and backup purposes.
The working repository remains the separate-file structure in the pack.

## Canonical provider policy
Approved external AI-related providers are limited to Google Cloud and Hugging Face.
All non-AI application state remains local-first.

---

## File: `.env.example`

```
AI_PROVIDER=mock
ENABLE_PROVIDER_CALLS=false
ENABLE_REAL_RETRIEVAL=false
GOOGLE_CLOUD_PROJECT_ID=
GOOGLE_CLOUD_LOCATION=
GOOGLE_CLOUD_VERTEX_MODEL=
GOOGLE_CLOUD_EMBED_MODEL=
GOOGLE_CLOUD_DOC_AI_PROCESSOR_ID=
GOOGLE_CLOUD_SPEECH_RECOGNIZER=
GOOGLE_APPLICATION_CREDENTIALS=
HF_BASE_URL=https://router.huggingface.co/v1
HF_API_KEY=
HF_MODEL=
DB_PATH=./data/indexes/geologix_legal_ai.sqlite
DATA_ROOT=./data
APP_NAME=GeoLogix-Legal-AI
```

---

## File: `AGENTS.md`

```markdown
# GeoLogix-Legal-AI — Repository Instructions

## Purpose
This repository contains the design, build instructions, prompt system, and application scaffold for GeoLogix-Legal-AI.

## Source-of-truth order
1. Safety and scope documents
2. Product and architecture documents
3. Data model and prompt architecture documents
4. Acceptance criteria and release criteria
5. Build prompts and implementation notes
6. Code

If code and docs conflict, update docs first or align code to the docs immediately.

## Non-negotiable rules
- This product is a simulation and preparation system, not legal advice.
- Retrieved legal materials must always remain visibly distinct from simulated argumentation and coaching commentary.
- Defense-side and opposition-side actors must work from the same case record.
- Runtime actor design is first-class product architecture, not a side note.
- Do not fabricate statutes, cases, evidence, or procedural events.
- Do not hide placeholders behind confident wording.
- Every new feature must state whether it is deterministic, retrieval-grounded, or model-generated.
- Approved external AI providers are limited to **Google Cloud** and **Hugging Face**.

## Build model
There are two separate role systems in this repository:
1. **Build roles** used to create and maintain the software.
2. **Runtime legal actors** used inside the application to simulate both sides of a matter.

Do not confuse the two.

## Folder ownership
- `docs/` = product, legal, architecture, QA, and release documents
- `prompts/` = runtime and build prompt assets
- `src/` = UI and API code
- `services/` = adapters and orchestration contracts
- `tests/` = deterministic and regression validation
- `data/` = local runtime storage and legal source registry
- `config/` = repository conventions and build notes

## Implementation constraints
- local-first default for state, storage, and exports
- SQLite + FTS5 baseline
- provider abstraction with `mock`, `google-cloud`, and `huggingface`
- deterministic simulation before probabilistic enrichment
- exportable scenario packs as a first-class feature
- no AI provider secrets in client code, source control, logs, or exported artifacts

## Done criteria for a feature
A feature is not done unless:
- docs are aligned
- tests exist or are explicitly deferred with reason
- placeholder status is clear
- outputs are labeled correctly
- privacy and disclaimer checks pass
- provider usage matches the approved provider policy
```

---

## File: `README.md`

```markdown
# GeoLogix-Legal-AI

GeoLogix-Legal-AI is a local-first, AI-assisted South African legal simulation platform designed to help a user prepare, test, and stress-check a matter before a real dispute escalates. It is a simulation and preparation system, not a law firm system and not legal advice.

## Product intent
The application simulates a real adversarial dispute using one shared case record and multiple actor layers:
- the **user-side legal team** that helps the user prepare and strategise
- the **opposing-side legal team** that counters the user's framing using the same facts and evidence
- the **neutral court layer** that controls procedure, asks questions, rules on objections, and evaluates credibility and coherence
- the **scenario engine** that branches into best-case, likely-case, worst-case, settlement, and credibility-collapse paths
- the **export layer** that lets the user download transcripts, scenario packs, strategy comparisons, and evidence gap reports

## Core principles
- local-first for application state and document handling
- one shared case record
- adversarial simulation across both sides
- no invented legal citations
- clear separation between retrieved legal material, simulation behaviour, and coaching commentary
- explicit confidence, provenance, and disclaimer handling
- modular architecture with replaceable AI providers
- **approved AI providers only:** Google Cloud and Hugging Face

## Approved AI provider policy
Use only these external AI providers:
- **Google Cloud** for managed reasoning, OCR, transcription, and optional embeddings
- **Hugging Face** for alternative model inference and optional embedding services

Keep these layers local-first:
- case database
- uploaded evidence files
- transcript store
- retrieval index metadata
- export generation
- scenario archives

## Canonical reading order
1. `AGENTS.md`
2. `docs/00_Project_Charter.md`
3. `docs/02_PRD.md`
4. `docs/09_System_Architecture.md`
5. `docs/10_Data_Model.md`
6. `docs/11_API_and_Provider_Strategy.md`
7. `docs/12_Prompt_Architecture.md`
8. `docs/25_COMPLETE_APPLICATION_EXECUTION_SPEC.md`
9. `docs/26_FULL_STACK_LOCAL_AI_SPEC.md`
10. `docs/29_Runtime_Courtroom_Actor_Model.md`
11. `docs/30_Adversarial_Simulation_and_Branching.md`
12. `docs/31_Defense_vs_Opposition_Strategy_Model.md`
13. `docs/32_Scenario_Exports_and_Downloadables.md`
14. `docs/33_APPROVED_AI_PROVIDER_POLICY.md`

## Prompt execution order
1. `prompts/build/01_build_complete_application_master.md`
2. `prompts/build/02_complete_local_backend_and_storage.md`
3. `prompts/build/03_complete_frontend_experience.md`
4. `prompts/build/04_complete_local_ai_and_retrieval.md`
5. `prompts/build/05_complete_evaluation_replay_export.md`
6. `prompts/build/06_complete_end_to_end_testing_and_release.md`

## Runtime actor prompt sets
- `prompts/defense/*`
- `prompts/opposition/*`
- `prompts/court/*`
- `prompts/scenarios/*`
- `prompts/system/*`
- `prompts/safety/*`

## Stack target
- React + TypeScript + Vite frontend
- Fastify local API
- SQLite + FTS5 for persistence and lexical retrieval
- Google Cloud and Hugging Face for AI-related capabilities only
- file-based prompt governance
- export pipeline for scenario packages

## Delivery rule
Documents remain the source of truth until formally updated. Code must follow the docs, not the other way around.
```

---

## File: `config/BUILD_AGENT_NOTES.md`

```markdown
# Build Agent Notes

These notes are intentionally tool-agnostic so the repository can be used as a delivery document as well as a build package.

## Preferred execution pattern
- start from the canonical documents
- update docs before major architectural changes
- build in vertical slices: persistence, simulation, retrieval, scenario branching, export, QA
- keep runtime actor behaviour traceable to the case record and prompt files
- keep all non-AI state local-first
- use only approved AI providers: Google Cloud and Hugging Face

## Build priorities
1. shared case record
2. local persistence
3. deterministic procedural engine
4. defense/opposition runtime actors
5. legal retrieval
6. provider abstraction and approved AI integrations
7. scenario exports
8. end-to-end testing
```

---

## File: `config/COMPLETE_APP_NOTES.md`

```markdown
# Complete Application Notes

GeoLogix-Legal-AI should be treated as a complete application target, not a thin MVP shell.

## Required product layers
- intake and shared case record
- defense-side preparation tools
- opposition-side counter-analysis
- neutral court procedure and rulings
- scenario branching and comparison
- downloadable output packs
- local legal retrieval and citation display
- evaluation, coaching, and replay
- approved AI provider orchestration using Google Cloud and Hugging Face

## Architecture principle
Use one canonical case record and derive all actor outputs from that shared record. Multiple sides may interpret the record differently, but they must not invent a second hidden fact base.
```

---

## File: `config/env.ts`

```typescript
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().default('4301'),
  AI_PROVIDER: z.enum(['mock', 'google-cloud', 'huggingface']).default('mock'),
  ENABLE_REAL_RETRIEVAL: z.string().default('false'),
  ENABLE_PROVIDER_CALLS: z.string().default('false'),
  GOOGLE_CLOUD_PROJECT_ID: z.string().optional(),
  GOOGLE_CLOUD_LOCATION: z.string().optional(),
  GOOGLE_CLOUD_VERTEX_MODEL: z.string().optional(),
  GOOGLE_CLOUD_EMBED_MODEL: z.string().optional(),
  GOOGLE_CLOUD_DOC_AI_PROCESSOR_ID: z.string().optional(),
  GOOGLE_CLOUD_SPEECH_RECOGNIZER: z.string().optional(),
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),
  HF_BASE_URL: z.string().default('https://router.huggingface.co/v1'),
  HF_API_KEY: z.string().optional(),
  HF_MODEL: z.string().optional()
});

export function readServerEnv() {
  return envSchema.parse(process.env);
}
```

---

## File: `docs/00_Project_Charter.md`

```markdown
# Project Charter

## Purpose
Provide the authoritative specification for the project mission, scope, constraints, and success metrics.

## Owner / Responsible Role
Product Strategist

## Dependencies
01_Product_Vision.md, 02_PRD.md

## Acceptance Criteria
- scope and non-goals are explicit
- approved AI provider policy is explicit
- success criteria are measurable

## Required Contents
Repo mission, scope, success metrics, non-goals, delivery guardrails

## Mission
Build GeoLogix-Legal-AI as a local-first South African courtroom simulation application that helps a user prepare, strategise, and stress-test a matter through defense-side support, opposition-side counter-analysis, neutral court procedure, scenario branching, and downloadable reports.

## In scope
- one locally runnable web app
- one local Fastify API
- SQLite persistence
- local case/session/evidence/transcript lifecycle
- deterministic courtroom engine
- approved AI provider integrations for runtime actor enrichment
- local retrieval over selected South African legal sources
- visible disclaimers and confidence badges
- automated tests and smoke checks
- scenario exports and downloadable outcome packs

## Approved AI provider policy
External AI-related capabilities may use only:
- Google Cloud
- Hugging Face

All non-AI application state remains local-first.

## Out of scope
- live court filing
- live multi-user collaboration
- cloud-hosted application state as the primary mode
- advanced authentication
- automatic scraping at scale without review
- unsupervised legal answer generation presented as advice

## Success metrics
- app boots locally after dependency install
- user can complete one full simulation round trip
- retrieval returns grounded legal source material from seeded docs
- transcript and evaluation are saved locally
- provider health checks work for mock and at least one approved provider
- smoke test suite passes

## Delivery rule
Whenever time pressure creates conflict, prefer a smaller working feature over a larger pretend feature.
```

---

## File: `docs/05_Feature_Prioritization_MVP.md`

```markdown
# Feature Prioritization MVP

## Purpose
Provide the authoritative must/should/could/won't prioritization.

## Owner / Responsible Role
Product Strategist

## Dependencies
02_PRD.md

## Acceptance Criteria
- priorities match the complete-app build order
- provider policy is reflected in the AI tasks

## Required Contents
Must/should/could/won't prioritization

## Must have
- run locally
- create case
- persist session
- deterministic courtroom loop
- Google Cloud and Hugging Face provider health checks
- local source ingestion for a controlled source pack
- transcript review
- evaluation summary
- smoke tests

## Should have
- lexical retrieval with optional embedding re-rank
- seeded scenario templates
- export transcript to markdown or pdf-ready format

## Could have
- multiple case archetypes
- persona difficulty levels
- source browser filters

## Won't have initially
- multi-user login
- cloud sync for case state
- production auth
- external vector database server
```

---

## File: `docs/08_RAG_and_Ingestion_Architecture.md`

```markdown
# RAG and Ingestion Architecture

## Purpose
Provide the authoritative parsing, chunking, indexing, and retrieval pipeline.

## Owner / Responsible Role
SA Legal Retrieval Engineer

## Dependencies
07_South_African_Legal_Data_Sources.md, 09_System_Architecture.md

## Acceptance Criteria
- ingestion stages are explicit
- retrieval works without embeddings
- approved provider options for embeddings are explicit

## Required Contents
Parsing, chunking, indexing, retrieval pipeline

## Retrieval architecture
### Step 1: controlled ingestion
- place approved source files in `data/legal_sources/raw`
- register them in `data/legal_sources/registry.json`
- tag each source with trust tier, jurisdiction, and provenance notes

### Step 2: parse
- extract text from markdown, txt, html, and pdf where parser exists
- normalize whitespace, headings, page references, and section lineage

### Step 3: chunk
- target 500–900 token-equivalent chunks
- preserve heading lineage
- assign chunk ids, source ids, offsets, and page/section metadata

### Step 4: index
- store chunk text in SQLite
- mirror searchable text into an FTS5 virtual table
- optionally generate embeddings through an approved provider when enabled

### Step 5: retrieve
- FTS5 lexical search first
- optional embedding re-rank second
- return grounded chunks with scores, confidence, and provenance

## Embedding policy
Embeddings are optional in the first retrieval pass. If enabled, use only:
- Google Cloud embedding services
- Hugging Face embedding services

## Core rule
No model may invent a citation. Citations must point to ingested, traceable source material.
```

---

## File: `docs/09_System_Architecture.md`

```markdown
# 09 — System Architecture

## Purpose
Describe the complete system architecture for GeoLogix-Legal-AI.

## Owner
System architect

## Dependencies
02_PRD, 10_Data_Model, 11_API_and_Provider_Strategy, 12_Prompt_Architecture

## Acceptance criteria
- shows distinct runtime actor layers
- shows shared case record as canonical state
- shows export pipeline and scenario branching
- reflects approved provider policy

## Architecture layers
### A. Presentation layer
React frontend for intake, matter workspace, actor panels, transcript view, scenario comparison, and exports.

### B. Application API layer
Fastify API for intake, persistence, simulation execution, retrieval, export generation, and health/config endpoints.

### C. Shared case record layer
Canonical stored representation of facts, evidence, witnesses, issues, claims, defenses, and unresolved gaps.

### D. Runtime actor orchestration layer
Orchestrates defense-side, opposition-side, and neutral court actors against the same case record.

### E. Simulation engine layer
Procedural state machine handling hearing stages, turn order, objections, rulings, and transcript capture.

### F. Retrieval layer
SQLite FTS5 / BM25-style retrieval over curated South African legal materials and local matter documents.

### G. Approved AI provider layer
Provider abstraction supporting:
- `mock`
- `google-cloud`
- `huggingface`

Google Cloud is the primary managed provider. Hugging Face is the secondary flexible provider.

### H. Export and reporting layer
Generates transcripts, scenario packs, side-by-side comparisons, evidence gap reports, and hearing summaries.

## Core rule
All runtime actors read from the same shared case record. They may apply different strategies and weights, but they may not create a hidden second evidence base.

## Runtime actor groups
- defense team
- opposition team
- neutral court
- evaluator and scenario comparator

## Processing order
1. Intake and validation
2. Case record normalization
3. Defense-side preparation
4. Opposition-side counter-analysis
5. Procedural simulation
6. Branch generation
7. Evaluation and export
```

---

## File: `docs/11_API_and_Provider_Strategy.md`

```markdown
# API and Provider Strategy

## Purpose
Define the server API surface, provider abstraction, provider modes, and response discipline.

## Owner / Responsible Role
Full-Stack Engineer

## Dependencies
09_System_Architecture.md

## Acceptance Criteria
- approved provider policy is explicit
- routes are implementation-ready
- failure handling is explicit

## Required Contents
Server API, provider abstraction, provider failover, response discipline

## Provider modes
- `disabled`
- `mock`
- `google-cloud`
- `huggingface`

## MVP provider decision
- default to **mock** until secrets, retrieval, and structured-output tests are validated
- promote **google-cloud** to primary live provider once server-side credentials and response contracts are validated
- enable **huggingface** as a secondary or specialist provider once response normalization is validated

## Provider responsibilities
### Google Cloud
Use for:
- primary structured generation for runtime actors
- optional embeddings
- OCR for scanned documents if enabled
- speech transcription if enabled

### Hugging Face
Use for:
- alternative model inference
- open-model experimentation
- optional embeddings

## Explicitly disallowed external AI providers
Any external AI provider other than Google Cloud and Hugging Face is out of scope for the canonical build.

## Fastify routes
- `GET /api/health`
- `GET /api/config`
- `GET /api/providers/health`
- `POST /api/cases`
- `GET /api/cases/:id`
- `POST /api/cases/:id/evidence`
- `POST /api/sessions`
- `GET /api/sessions/:id`
- `POST /api/sessions/:id/turn`
- `POST /api/sessions/:id/object`
- `POST /api/retrieval/search`
- `POST /api/ingest/source-pack`
- `GET /api/transcripts/:sessionId`
- `GET /api/evaluations/:sessionId`
- `POST /api/exports/:sessionId`

## Response discipline
All API responses must be structured JSON with explicit fields when relevant:
- `mode`
- `grounded`
- `confidence`
- `warnings`
- `citations`
- `provider`

## Failure handling
- provider timeout -> structured provider error
- malformed provider response -> reject and return fallback path
- provider unavailable -> fallback to `mock` if permitted by config
- missing retrieval support -> return no citations and a visible warning
```

---

## File: `docs/17_Security_Privacy_and_Compliance.md`

```markdown
# Security Privacy and Compliance

## Purpose
Define privacy, secret handling, redaction, local storage boundaries, and provider safety rules.

## Owner / Responsible Role
Security / Privacy Reviewer

## Dependencies
06_Legal_Scope_and_Disclaimers.md, 11_API_and_Provider_Strategy.md, 22_Deployment_Local_Runbook.md

## Acceptance Criteria
- provider secrets remain server-side
- local-first boundaries are explicit
- export and log rules are explicit

## Required Contents
Local storage rules, redaction, logs, secrets, POPIA-aware handling

## Local-first boundaries
Keep the following local by default:
- case metadata
- uploaded evidence files
- transcript history
- retrieval index metadata
- generated exports
- scenario archives

## Approved provider rules
Only Google Cloud and Hugging Face may be used for external AI-related calls.

## Secret handling
- never expose secrets in client code
- never commit secrets to the repository
- load secrets from environment variables or a secure local secret store
- do not log raw provider credentials or raw authorization headers

## Data minimization rule
When sending content to an approved provider, send only the minimum material required for the task.

## Redaction rule
Before provider calls, support a redaction layer for:
- personal identifiers
- contact details
- unnecessary financial details
- sensitive user notes not needed for the task

## Compliance note
This app is a simulation and preparation system. It must not present itself as a legal-advice platform.
```

---

## File: `docs/18_Dev_Environment_and_IDE_Setup.md`

```markdown
# Dev Environment and IDE Setup

## Purpose
Describe the local development environment and the repository instruction model.

## Owner / Responsible Role
Tooling Specialist

## Dependencies
README.md, AGENTS.md

## Acceptance Criteria
- instructions are tool-agnostic
- required local tools are explicit
- provider prerequisites are explicit

## Required Contents
AI-assisted coding setup and local tooling

## Repository instruction model
- open the repo root in your coding environment
- let the environment index the repository, excluding `.codeiumignore` paths
- read root `AGENTS.md`
- use folder-scoped `AGENTS.md` guidance when working inside `docs`, `prompts`, `src`, `src/server`, and `tests`

## Required local tools
- Node 20+
- npm 10+
- SQLite available through the app dependency layer
- Google Cloud credentials available if using `google-cloud`
- Hugging Face API key available if using `huggingface`

## Build workflow
1. read the canonical docs first
2. scaffold or update modules in controlled phases
3. run tests after each phase
4. fix type errors immediately
5. do not skip the smoke test phase
```

---

## File: `docs/19_Implementation_Roadmap.md`

```markdown
# Implementation Roadmap

## Purpose
Provide the phased execution plan.

## Owner / Responsible Role
Product Strategist

## Dependencies
20_Backlog.md, 21_Acceptance_Criteria.md

## Acceptance Criteria
- phases are ordered cleanly
- AI provider work happens after deterministic and retrieval foundations

## Required Contents
Phased execution plan

## Phase order
1. runtime validation
2. persistence
3. deterministic simulation engine
4. source ingestion and lexical retrieval
5. approved AI provider integration
6. transcript + evaluation UX
7. exports, replay, and scenario comparison
8. integration tests and hardening
```

---

## File: `docs/20_Backlog.md`

```markdown
# Backlog

## Purpose
Provide prioritized stories and technical tasks.

## Owner / Responsible Role
Product Strategist

## Dependencies
02_PRD.md, 19_Implementation_Roadmap.md

## Acceptance Criteria
- P0 tasks are build-critical
- provider tasks match the approved provider policy

## Required Contents
Prioritized stories and tech tasks

## P0
- validate current scaffold and fix broken imports
- implement SQLite repositories
- implement session state and transcript persistence
- implement deterministic turn engine
- implement provider abstraction and health route
- add Google Cloud provider adapter placeholder
- validate Hugging Face provider adapter
- implement source pack ingestion
- implement FTS5 search service
- wire simulation room to API
- implement evaluation summary endpoint
- add end-to-end smoke tests

## P1
- embedding re-rank
- source filters
- transcript export
- scenario presets
```

---

## File: `docs/22_Deployment_Local_Runbook.md`

```markdown
# Deployment Local Runbook

## Purpose
Explain how to run, validate, and troubleshoot the application locally.

## Owner / Responsible Role
Tooling Specialist

## Dependencies
18_Dev_Environment_and_IDE_Setup.md

## Acceptance Criteria
- startup steps are explicit
- provider validation steps are explicit
- troubleshooting covers approved providers

## Required Contents
How to run, test, and troubleshoot locally

## Local run
```bash
npm install
npm run dev
```

## Provider setup
### Mock mode
- keep `AI_PROVIDER=mock`
- keep `ENABLE_PROVIDER_CALLS=false`

### Google Cloud mode
- set `AI_PROVIDER=google-cloud`
- set `ENABLE_PROVIDER_CALLS=true`
- configure `GOOGLE_APPLICATION_CREDENTIALS`
- configure project, location, and model environment variables
- confirm provider health from `/api/providers/health`

### Hugging Face mode
- set `AI_PROVIDER=huggingface`
- set `ENABLE_PROVIDER_CALLS=true`
- configure `HF_API_KEY`
- configure `HF_MODEL`
- confirm provider health from `/api/providers/health`

## Data locations
- database: `data/indexes/geologix_legal_ai.sqlite`
- uploads: `data/uploads`
- legal sources: `data/legal_sources/raw`
- source registry: `data/legal_sources/registry.json`

## Troubleshooting
### provider unhealthy
- confirm `AI_PROVIDER` is valid
- confirm environment variables are present
- confirm the server can read credentials
- confirm outbound access to the selected approved provider

### retrieval empty
- confirm source pack ingested
- confirm FTS table populated
- confirm query is not blank
```

---

## File: `docs/23_Risks_Assumptions_Dependencies.md`

```markdown
# Risks Assumptions Dependencies

## Purpose
List key risks, assumptions, and mitigations.

## Owner / Responsible Role
Product Strategist

## Dependencies
All core docs

## Acceptance Criteria
- major technical and provider risks are explicit
- mitigations are practical

## Required Contents
Key risks and mitigations

## Major risks
### provider quality variance
Google Cloud and Hugging Face outputs may differ in structure or style.
Mitigation: strict response normalization, structured-output tests, and visible confidence labels.

### source quality
Garbage in, garbage out.
Mitigation: controlled source registry and trust tiers.

### time pressure
Too many features can break the build.
Mitigation: hold line on the canonical build order.

### provider availability
Credentials, quotas, or network access may fail.
Mitigation: mock fallback, health checks, and deterministic core behaviour.
```

---

## File: `docs/24_Next_Steps_for_User.md`

```markdown
# 24 — Next Steps for the User

## Purpose
Provide the exact next sequence for completing the application.

## Owner
Documentation owner

## Dependencies
25_COMPLETE_APPLICATION_EXECUTION_SPEC, 28_GENERAL_BUILD_ORDER

## Next steps
1. Review the canonical docs and confirm the shared-case-record principle.
2. Approve the runtime actor model for defense, opposition, and court.
3. Approve the external AI provider policy: Google Cloud and Hugging Face only.
4. Build local persistence and matter editing.
5. Build deterministic procedural simulation.
6. Add runtime actor orchestration.
7. Add local legal retrieval and citation rendering.
8. Add approved AI provider integrations for actor enrichment.
9. Build scenario branching and export bundles.
10. Run end-to-end testing and release review.
```

---

## File: `docs/25_COMPLETE_APPLICATION_EXECUTION_SPEC.md`

```markdown
# 25 — Complete Application Execution Specification

## Purpose
Define the execution sequence for delivering the full application.

## Owner
Implementation lead

## Dependencies
02_PRD, 09_System_Architecture, 29_Runtime_Courtroom_Actor_Model

## Acceptance criteria
- covers the full stack front to back
- includes runtime legal actor delivery, not just infrastructure
- reflects the approved provider policy

## Delivery sequence
1. shared case record and persistence
2. intake and evidence management UI
3. deterministic procedural engine
4. defense and opposition actor orchestration
5. judge/clerk/witness orchestration
6. local retrieval and citation display
7. approved AI provider integration
8. scenario branching and comparison
9. export bundle generation
10. full test and release gate
```

---

## File: `docs/26_FULL_STACK_LOCAL_AI_SPEC.md`

```markdown
# 26 — Full Stack AI Services Specification

## Purpose
Specify the AI-services layer for the completed application while preserving local-first application state.

## Owner
AI systems lead

## Dependencies
11_API_and_Provider_Strategy, 08_RAG_and_Ingestion_Architecture

## Acceptance criteria
- provider policy is explicit
- generation and embeddings paths are modular
- local-first boundaries remain clear

## AI service baseline
- Google Cloud as the primary managed AI provider
- Hugging Face as the secondary flexible AI provider
- SQLite FTS5 for baseline retrieval
- optional embedding re-rank once lexical retrieval is stable

## Runtime AI usage
- defense actor reasoning drafts
- opposition actor counter-drafts
- witness answer generation within case constraints
- judge question enrichment
- scenario branch narrative generation
- export summarisation

## Guardrails
- model outputs are never treated as legal authority by themselves
- retrieval context is displayed separately
- low-confidence model outputs must be flagged
- only approved providers may be called externally
- case state, transcripts, and exports remain local-first
```

---

## File: `docs/27_END_TO_END_TEST_AND_RELEASE_SPEC.md`

```markdown
# 27 — End-to-End Test and Release Specification

## Purpose
Define the end-to-end validation and release gate for GeoLogix-Legal-AI.

## Owner
QA lead

## Dependencies
16_Testing_and_QA_Strategy.md, 21_Acceptance_Criteria.md

## Acceptance criteria
- deterministic and provider-assisted flows are both covered
- release gate is explicit and honest

## Required test lanes
- local persistence lane
- deterministic simulation lane
- retrieval lane
- Google Cloud provider lane
- Hugging Face provider lane
- export lane
- disclaimer and confidence-label lane

## Release gate
The application is not ready for controlled use until:
- deterministic simulation passes
- retrieval returns traceable citations
- at least one approved provider passes structured-output tests
- exports open correctly
- disclaimers and confidence labels are visible
```

---

## File: `docs/28_GENERAL_BUILD_ORDER.md`

```markdown
# 28 — General Build Order

## Purpose
Provide a generic, hand-in-ready build order without tying the project to a specific IDE.

## Owner
Implementation lead

## Dependencies
25_COMPLETE_APPLICATION_EXECUTION_SPEC

## Build order
1. lock canonical docs
2. complete data model and shared case record
3. implement local storage and retrieval scaffolding
4. build intake, matter workspace, and evidence handling
5. implement deterministic procedure engine
6. implement defense and opposition runtime actor orchestration
7. implement judge, clerk, witness, and objections flow
8. add local legal retrieval and citation rendering
9. add approved AI provider integrations and confidence handling
10. add branching, comparison, replay, and exports
11. run full QA, privacy, and release review
```

---

## File: `docs/33_APPROVED_AI_PROVIDER_POLICY.md`

```markdown
# 33 — Approved AI Provider Policy

## Purpose
Lock the canonical provider policy for GeoLogix-Legal-AI.

## Owner
Architecture owner

## Dependencies
11_API_and_Provider_Strategy.md, 17_Security_Privacy_and_Compliance.md

## Acceptance Criteria
- approved providers are explicit
- local-first boundaries are explicit
- prohibited provider drift is explicit

## Canonical policy
Approved external AI-related providers are limited to:
- Google Cloud
- Hugging Face

## Allowed external AI uses
- generation
- embeddings
- OCR
- transcription
- structured reasoning support

## Local-first retained layers
- case state
- evidence store
- transcript store
- retrieval index metadata
- export bundles
- scenario history

## Prohibited drift
Do not introduce additional external AI providers into the canonical build without updating this document and the provider strategy document first.
```

---

## File: `docs/outstanding/07_PROVIDER_INTEGRATION_SPEC.md`

```markdown
# 07 — Provider Integration Spec

## Purpose
Define safe, replaceable AI provider integrations after retrieval and deterministic behavior are working.

## Owner
Full-Stack Engineer + Prompt Engineer

## Dependencies
- prompt library
- config layer
- retrieval v1
- mock provider contract

## Acceptance Criteria
- mock remains default
- provider calls are feature-flagged
- request and response contracts are normalized
- timeouts and failures degrade gracefully
- no provider secret appears in logs or client code
- approved provider policy is enforced

## Supported Modes
- mock
- google-cloud
- huggingface

## Environment Variables
- AI_PROVIDER
- ENABLE_PROVIDER_CALLS
- GOOGLE_CLOUD_PROJECT_ID
- GOOGLE_CLOUD_LOCATION
- GOOGLE_CLOUD_VERTEX_MODEL
- GOOGLE_CLOUD_EMBED_MODEL
- GOOGLE_APPLICATION_CREDENTIALS
- HF_BASE_URL
- HF_API_KEY
- HF_MODEL

## Required Provider Interface
- healthCheck()
- generateRoleTurn()
- generateCoaching()
- generateEvaluation()
- summarizeTranscript()
- embedText()

## Failure Handling
- timeout -> return structured provider error
- malformed response -> reject and fallback
- provider unavailable -> fallback to mock if allowed
- missing retrieval support -> no citations emitted

## Security Rules
- no client-side secret exposure
- no raw prompt logging in production-like mode
- redact user-supplied notes in error traces where possible
```

---

## File: `prompts/build/01_build_complete_application_master.md`

```markdown
# Build Complete Application — Master Prompt

You are implementing GeoLogix-Legal-AI as a full local-first application.

## Goal
Build the complete application front to back using the repository documents as the source of truth.

## Mandatory rules
- follow the shared case record model
- build runtime legal actors for both sides and the neutral court
- do not fabricate legal authority
- keep retrieval visibly separate from simulation text
- implement exports and scenario branching as product features, not stretch goals
- keep application state local-first
- use only approved external AI providers: Google Cloud and Hugging Face

## Deliver in this order
1. persistence and data model alignment
2. intake and matter workspace
3. deterministic procedure engine
4. defense/opposition runtime actors
5. court layer
6. retrieval and citations
7. approved AI provider integration
8. scenario branching
9. export bundles
10. end-to-end tests
```

---

## File: `prompts/build/04_complete_local_ai_and_retrieval.md`

```markdown
# Complete AI and Retrieval

Add retrieval and approved AI provider integrations to GeoLogix-Legal-AI.

## Requirements
- SQLite FTS5 retrieval baseline
- citation objects rendered separately from simulation output
- low-confidence fallbacks
- provider abstraction supporting:
  - mock
  - google-cloud
  - huggingface
- no external AI provider beyond Google Cloud and Hugging Face
- secrets remain server-side
```

---

## File: `prompts/build/06_complete_end_to_end_testing_and_release.md`

```markdown
# Complete End-to-End Testing and Release

Run the full validation pass for GeoLogix-Legal-AI.

## Required lanes
- persistence and recovery
- deterministic simulation
- retrieval and citations
- Google Cloud provider lane
- Hugging Face provider lane
- export generation
- disclaimer and confidence labeling

## Rules
- do not mark the app complete if only mock mode works
- do not mark the app complete if citations are invented or untraceable
- do not mark the app complete if provider secrets leak into logs or client code
```

---

## File: `prompts/build/README.md`

```markdown
# Build Prompt Sequence

Use these prompts in order.

1. `01_build_complete_application_master.md`
2. `02_complete_local_backend_and_storage.md`
3. `03_complete_frontend_experience.md`
4. `04_complete_local_ai_and_retrieval.md`
5. `05_complete_evaluation_replay_export.md`
6. `06_complete_end_to_end_testing_and_release.md`

Approved external AI providers are limited to Google Cloud and Hugging Face.
```

---

## File: `services/ai/GoogleCloudProvider.ts`

```typescript
import type { AIProvider, GenerationInput, GenerationResult } from './AIProvider';

export class GoogleCloudProvider implements AIProvider {
  name = 'google-cloud';

  async health() {
    return { ok: false, detail: 'Placeholder adapter only. Replace after Google Cloud credential and model validation.' };
  }

  async generateStructuredResponse(_input: GenerationInput): Promise<GenerationResult> {
    return {
      text: 'Google Cloud adapter placeholder. Enable only after server-side credential and structured-output validation.',
      provider: this.name,
      placeholder: true
    };
  }
}
```

---

## File: `services/ai/HuggingFaceProvider.ts`

```typescript
import type { AIProvider, GenerationInput, GenerationResult } from './AIProvider';

export class HuggingFaceProvider implements AIProvider {
  name = 'huggingface';

  async health() {
    return { ok: false, detail: 'Placeholder adapter only. Replace after Hugging Face key and response-contract validation.' };
  }

  async generateStructuredResponse(_input: GenerationInput): Promise<GenerationResult> {
    return {
      text: 'Hugging Face adapter placeholder. Enable only after server-side secret and response normalization validation.',
      provider: this.name,
      placeholder: true
    };
  }
}
```
