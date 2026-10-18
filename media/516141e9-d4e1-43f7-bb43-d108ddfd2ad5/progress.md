# GeoLogix-Legal-AI Genesis App Build

## Space ID: skv5bpom39mudmpl

## What is this?
South African legal simulation platform. Local-first, AI-assisted. NOT legal advice.
App simulates adversarial court dispute prep with:
- Defense-side legal team
- Opposition-side legal team  
- Neutral court layer
- Scenario branching (best/likely/worst/settlement)
- Export transcripts/reports

## AI Providers in original spec
- Google Cloud + Hugging Face (unavailable in Taskade)
- REPLACEMENT: Use Taskade AI (OpenAI) - @taskade/automade-internalpiece-openai

## Stack (Taskade Genesis)
- React + TypeScript + Vite (already set up)
- Taskade Projects = database/storage
- Taskade Agents = AI actors
- Taskade Automations = workflow triggers
- UI: Radix UI + Tailwind + Framer Motion

## Build Plan (subtasks)
### SUBTASK 1: Projects (data layer) - STATUS: PENDING
- Case Record Project (structured DB)
- Sessions/Transcripts Project
- Legal Source Registry Project (knowledge base)
- Scenario Branches Project

### SUBTASK 2: Agents - STATUS: PENDING
- Defense Counsel Agent
- Opposition Counsel Agent
- Presiding Judge Agent (neutral court)
- Scenario Analyst Agent (branches/exports)

### SUBTASK 3: Automations - STATUS: PENDING
- New Case Created → AI analysis trigger
- Session Turn → Actor response workflow

### SUBTASK 4: App UI - STATUS: PENDING
- Landing / Case Intake
- Matter Workspace (main simulation)
- Courtroom Session (live simulation)
- Transcript Viewer
- Scenario Comparison
- Export Panel
- Floating AI Assistant Chat

## Key Design Decisions
- Dark mode first (legal/courtroom = serious, focused)
- Deep slate/graphite palette with amber/gold accents (legal gravitas)
- Glass morphism surfaces
- Cinematic transitions

## Created Resources
### Projects
- Case Records: 259uxbeKQK1M4JMx
- Evidence & Sessions: Q4n7yQh1fxdW3F5m
- SA Legal Knowledge Base: 65kkHAkqF9TnVnFg
- Scenario Branches: 9umTDYGtXkXJfTom

### Agents (all public)
- Defense Counsel: 01KKRZ2KAT4Q2J3QMYDF0PN6FZ
- Opposition Counsel: 01KKRZ30QRJJXQFW25AJFFMMB1
- Presiding Judge: 01KKRZ3HA3DK1D7ZY4Y7FPES6J
- Scenario Analyst: 01KKRZ40NHJHCV4K0PJT3NB5TH

### API Base: /api/taskade
- GET/POST /projects/{id}/nodes
- PATCH/DELETE /projects/{id}/nodes/{nodeId}
- POST /agents/{id}/public-conversations
- GET /agents/{id}/public-conversations/{convoId}/stream (SSE)
- POST /agents/{id}/public-conversations/{convoId}/messages

## Status
[x] Step 1: Create Projects
[x] Step 2: Create Agents
[x] Step 3: Connect Knowledge
[x] Step 4: Discover APIs
[x] Step 5: Build App UI - COMPLETE
## Fix Session (March 2026)
- Root cause: VxAssistant + AgentChat used manual SSE (api.openStream) instead of SDK
- SDK (src/lib/agent-chat) was available and is the correct approach
- VxAssistant: full rewrite using useAgentChat + createConversation from SDK
- AgentChat: full rewrite using useAgentChat + createConversation from SDK
  - Preserved: greeting synthetic message, briefing auto-send, auto-save scenario, saved pill, typing indicator, copy, timestamps
  - SDK MessageState.role is 'assistant' (not 'agent') — all role checks updated
  - Removed stale closure bugs entirely (SDK manages all state)
- ChevronDown unused import removed from VxAssistant

[x] Step 6: Chat + UX Improvements (March 2026)
  [x] 6a: VxAssistant floating widget (bottom-right FAB, lime gradient, minimise/close, starter prompts, typing indicator, copy, timestamps) - powered by Scenario Analyst agent
  [x] 6b: AgentChat typing indicator (3 animated dots in agent color shown between send and first text-delta)
  [x] 6c: AgentChat per-message timestamps (hover-reveal, localised en-ZA HH:MM)
  [x] 6d: AgentChat per-message copy button (hover-reveal, lime check on copy)
  [x] 6e: CaseBriefing defenseSummary textarea focus ring fixed (agent-color border + glow, matches allegations textarea)
  [x] 6f: Courtroom panel width changed from 420px fixed to clamp(360px, 32vw, 500px) for responsive comfort
  [x] 6g: VxAssistant integrated into App.tsx (renders on all screens)
  [x] 5a: index.css theme (dark legal palette - volcanic glass + amber gold)
  [x] 5b: types.ts + api.ts
  [x] 5c: store.ts (zustand)
  [x] 5d: Main App.tsx
  [x] 5e: Dashboard/Cases page + NewCaseModal
  [x] 5f: CaseDetail (overview/evidence/scenarios/courtroom tabs)
  [x] 5g: Scenario branches in CaseDetail
  [x] 5h: AgentChat (SSE streaming, all 4 actors)
  [x] 5i: Sidebar + KnowledgeBase page
  [x] CaseCard + StatusBadge components

STATUS: COMPLETE

## Visual Reskin v2: Full Veralogix Style Pass (March 2026)
- index.css: Added vx-btn-primary (lime pill), vx-btn-outline (ghost pill), vx-stat-number/label, vx-glass (backdrop-blur glassmorphism), vx-grid-texture (fine lime grid), vx-eyebrow (uppercase label)
- Sidebar: vx-glass + vx-grid-texture shell, VERA**LOGIX** uppercase wordmark, pill nav active indicator with glow
- Dashboard: vx-glass header, pill filter tabs with lime active, vx-stat-number counters with left-border accent, vx-btn-primary + ArrowRight CTA
- CaseDetail: vx-glass header, pill tabs with lime active glow, font-black titles, vx-eyebrow court label
- CaseCard: translucent glass card with lime border on hover, lime ArrowRight circle, font-black title, lime status glow
- NewCaseModal: vx-btn-primary/outline footer buttons, font-black + eyebrow header

## Visual Reskin: Veralogix Palette (March 2026)
- index.css CSS variables: charcoal background (0 0% 7%), lime-green primary (78 78% 52%)
- All amber/gold (#f59e0b, amber-*) replaced with lime-green (#a3e635)
- types.ts: STATUS_COLORS, SCENARIO_COLORS, ADMISSIBILITY_COLORS, AGENTS colors updated
- Analyst agent: #a3e635 (lime), Defense: #60a5fa, Opposition: #f87171, Judge: #a78bfa
- AgentChat: disclaimer, saving state, saved pill, connected dot → lime-green
- CaseBriefing: instruction banner, evidence side badges → lime-green + updated palette
- CaseDetail: disclaimer banner, scenario analyst button, count badge, pulse dot, context banner → lime-green
- Dashboard: stat icon colors → lime-green / blue / purple
- Sidebar: footer disclaimer → lime-green

## Full App Audit & Bug Fixes (March 2026)
Found and fixed 8 bugs across 6 files:

### Bug 1 — App.tsx: selectedCaseName never populated
- `handleSelectCase` only set the id, not the name
- Fix: look up case in store and set `selectedCaseName` from `found?.title`

### Bug 2 — Dashboard.tsx: hardcoded `+` on Active stat
- `${activeCount}+` showed a misleading `+` even at 0
- Fix: removed the `+`

### Bug 3+4 — AgentChat.tsx: stale closure in auto-save guard
- `savedScenarioId` read inside `setMessages` callback was always `null` (stale closure) → auto-save could fire multiple times
- `initialContext`, `caseRef`, `caseTitle` were used in useEffect but not in deps
- Fix: replaced `savedScenarioId` closure check with `autoSaveFiredRef.current` (useRef, set synchronously, never stale)

### Bug 5 — CaseDetail.tsx: export used unfiltered store arrays
- `evidence` and `scenarios` in store may contain items from other cases
- Fix: filter both arrays by `caseRecord.caseNumber` inside `buildExport()` before counting

### Bug 6 — CaseBriefing.tsx: invalid `focusRingColor` prop on textarea
- `style={{ focusRingColor: agent.color }}` does nothing
- Fix: replaced with `onFocus`/`onBlur` inline style (border + box-shadow) matching KnowledgeBase search bar pattern

### Bug 7 — NewCaseModal.tsx: `saving` not reset on success path
- If `onCreated()` threw, the button stayed stuck in `Creating…` spinner
- Fix: `setSaving(false)` called before `onCreated()`

### Bug 8 — CaseDetail.tsx: empty caseRef triggered wildcard API fetch
- `caseRecord?.caseNumber || ''` left `caseRef` as `''` if number was blank → load all records
- Fix: fallback to `caseRecord.id`, added truthy guard in useEffect

## Additional Features Added
- Drill Into Scenario: each scenario card has "Drill In" button
  - Derives agent role from title prefix [Defense Counsel / Opposition Counsel / Presiding Judge / Scenario Analyst]
  - Pre-fills briefing: summary → allegations, keyFactors → defenseSummary
  - Navigates to Courtroom tab with that agent selected, opens chat immediately
  - Amber "Scenario Context Pre-filled" banner above panel, dismissable
  - Banner clears on agent switch, briefing reset, or panel close
- Live scenario count badge on Scenarios tab (newScenarioCount in Zustand store)
  - Increments in AgentChat after doAutoSave succeeds
  - Animated amber badge with spring physics, glowing shadow, disappears on tab click
  - Clicking Scenarios tab also resets counter + re-fetches scenarios
- Auto-save: first agent response to briefing → saved as Scenario Branch (doAutoSave)
  - Defense → 'best' scenario type, Opposition → 'worst', Judge/Analyst → 'likely'
  - Derives title from first line, summary from first 400 chars, keyFactors from allegations+evidence
  - Shows "Saving scenario…" spinner in briefing badge, then "Saved to Scenarios" with BookmarkCheck
  - Saved pill animates in below the first agent response bubble with amber ring on the card
- CaseBriefing component: structured form before each agent session
  - User types allegations/facts, defense summary, and adds evidence items
  - Each evidence item has type, side, and description
  - Submitting briefing auto-sends formatted context to agent as first message
- AgentChat: added initialContext prop + briefing banner + buildBriefingMessage
- CaseDetail: per-agent briefing state (briefings map), reset button (RotateCcw)
