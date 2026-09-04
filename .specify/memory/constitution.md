# Mission Control — Project Constitution

Non-negotiable principles for the Mission Control platform. Every spec, plan, task,
and line of code is subordinate to this document. Agents and humans alike cite this
file when resolving disputes. Changes require explicit owner (Ronen) approval and a
version bump.

**Version:** 1.0.0 · **Owner:** Ronen · **Status:** Active

---

## 1. Product principles

1.1 **The dashboard is the system of record, not an observer.** All agent state
transitions flow through the Mission Control MCP server. No feature may infer state
by parsing transcripts. If it isn't an event in the ledger, it didn't happen.

1.2 **Progress is computed, never estimated.** Percent-complete derives from
spec → task → gate traceability. No UI element may display a progress number that
cannot be traced to ledger events.

1.3 **Human approval is a structural boundary, not a UI courtesy.** Merge authority
is enforced by git branch protection. The dashboard's Approve button performs the
merge; it never merely records an opinion.

1.4 **Managers operate from the Inbox.** Every design decision is tested against:
"Can a manager run the whole team from the Inbox screen?" Features that fragment
manager attention across screens require justification in an ADR.

## 2. Engineering principles

2.1 **Append-only event ledger.** Events are never updated or deleted. Corrections
are new events. The ledger is the audit artifact.

2.2 **Every write is scoped.** Agents receive scope globs on task claim. The
enforcement point is a PreToolUse hook backed by the control plane — never the
agent's good behavior.

2.3 **Leases, not locks.** Task ownership is a TTL lease with heartbeat. Lease
expiry emits an Inbox event; it never silently reassigns.

2.4 **Boring core, novel edges.** Control plane is CRUD + event store on Postgres.
Cleverness is reserved for the MCP contract and enforcement hooks.

2.5 **Tests are authored from acceptance criteria, never from implementation.**
Applies to agents building Mission Control and to agents managed by Mission Control.

2.6 **Model tiering is configuration, not convention.** Role templates pin the
model. No agent inherits a model implicitly.

## 3. Security and compliance principles

3.1 **No customer data, PHI, or secrets in the ledger, task text, prompts, or
agent-to-agent messages.** Task descriptions reference artifacts by ID/path, never
by content, when the content is sensitive.

3.2 **Tool allowlists are default-deny.** A role template enumerates permitted
tools; everything else is denied.

3.3 **Spend caps are hard kills.** Token/spend caps on roles and projects terminate
sessions at the boundary and emit an event. No soft warnings without enforcement.

3.4 **All human actions are attributable.** Every approval, answer, and override
records the authenticated manager identity.

## 4. Process principles

4.1 **This project is built by the process it implements.** Each phase runs as an
SDD cycle (spec → plan → tasks → implement) executed by an agent team with Ronen as
merge authority. Friction encountered while building is product signal.

4.2 **Phase exit criteria are binary.** A phase is done when its exit checklist
passes, not when it feels done.

4.3 **One ADR per irreversible decision.** Reversible decisions are made quickly
and noted in the task; irreversible ones (schema shape, MCP contract, tenancy
model) get an ADR in /docs/adr.

4.4 **The MCP contract is versioned from day one.** Breaking changes to Mission
Control tools require a version bump and a migration note, even pre-launch.

## 5. Stack constraints

- **Runtime/language:** TypeScript/Node for control plane and MCP server
  (consistent with existing Tebra MCP conventions).
- **Database:** Postgres (local/dev) with schema kept AlloyDB-compatible; no
  Postgres extensions unavailable on AlloyDB.
- **Agent runtime:** Claude Agent SDK (headless sessions), Sonnet-tier workers,
  Opus-tier orchestrator, Haiku-tier triage — pinned in role templates.
- **Git provider:** GitHub via GitHub App (worktrees, PRs, checks, branch
  protection).
- **Frontend:** React + TypeScript, realtime via SSE (WebSocket only if SSE proves
  insufficient — ADR required).
- **Deploy target:** Cloud Run (services + jobs); GKE only if job model proves
  insufficient — ADR required.
