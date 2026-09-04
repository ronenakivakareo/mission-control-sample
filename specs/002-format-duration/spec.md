# Feature Specification: `formatDuration(ms)`

**Feature Branch**: `mc/task-729a1e0f-036f-4c0f-80a8-68aa6663a8e3`
**Feature Number**: 002
**Created**: 2026-09-04
**Status**: Ready for planning
**Task**: 729a1e0f-036f-4c0f-80a8-68aa6663a8e3 — "Author the specification"

---

## Overview

A helper that converts a millisecond count into a short, human-readable duration
string such as `2m 30s`. It is a formatting utility only: it performs no
measurement, no locale negotiation, and no I/O.

It is the duration sibling of the existing `formatBytes` helper and is expected
to live alongside it in `src/format.js` as a named export, matching the module's
established convention.

---

## User Scenarios & Testing

### Primary User Story

A developer has an elapsed-time value in milliseconds — from a timer, a
benchmark, a job record — and wants to show it to a person. Raw milliseconds
(`150000`) are unreadable at a glance. The developer calls `formatDuration(ms)`
and gets a compact string (`2m 30s`) that can be dropped directly into a log
line, a CLI output, or a UI label.

### Acceptance Scenarios

These are normative. Each row is a required behavior.

| # | Input (ms) | Expected output | What it pins down |
|---|-----------|-----------------|-------------------|
| 1 | `150000` | `"2m 30s"` | The canonical example from the request |
| 2 | `90000` | `"1m 30s"` | Minutes and seconds both present |
| 3 | `60000` | `"1m"` | A zero seconds component is omitted, not shown as `1m 0s` |
| 4 | `999` | `"0s"` | Sub-second input floors to zero and is shown as `0s` |
| 5 | `59999` | `"59s"` | **Discriminating case for truncation.** Nearest-rounding would give `1m`; truncation gives `59s` |
| 6 | `0` | `"0s"` | Zero is not the empty string |
| 7 | `1000` | `"1s"` | Exactly one second |
| 8 | `7205000` | `"2h 5s"` | An *interior* zero unit is omitted; units do not have to be contiguous |
| 9 | `3661000` | `"1h 1m 1s"` | All three units present |
| 10 | `1500` | `"1s"` | A fractional second is truncated, never rounded up |

---

## Functional Requirements

- **FR-001** — The helper MUST accept a single argument: a duration expressed as
  a count of milliseconds.

- **FR-002** — The helper MUST return a string. It MUST NOT throw for any input
  (see FR-009), and MUST NOT return `null`, `undefined`, or the empty string.

- **FR-003 (Truncation)** — The input MUST be truncated toward zero to whole
  seconds before any formatting. Fractional seconds are discarded, never
  rounded up. *Derivation: the manager's "under a second, say `0s`" rule is only
  satisfiable under truncation — nearest-rounding would render `700` as `1s`.
  Confirmed by the manager during clarification.*

- **FR-004 (Decomposition)** — The whole-second total MUST be decomposed into
  hours, minutes, and seconds, where one minute is 60 seconds and one hour is
  3600 seconds.

- **FR-005 (Zero-unit suppression)** — Any unit whose value is zero MUST be
  omitted from the output. This applies to leading, trailing, **and interior**
  units — `7205000` renders as `2h 5s`, not `2h 0m 5s`.

- **FR-006 (Zero fallback)** — If every unit is zero, the output MUST be exactly
  `"0s"`. This is the single case in which a zero-valued unit is displayed, and
  it takes precedence over FR-005.

- **FR-007 (Format)** — Each present unit MUST be rendered as its integer value
  immediately followed by its single-character suffix — `h`, `m`, or `s` — with
  no space between number and suffix. Units MUST appear in descending order of
  magnitude, separated by exactly one space (U+0020). There is no trailing
  separator, no leading zero padding, and no thousands separator.

- **FR-008 (Hours cap)** — Hours are the largest unit. Durations of a day or
  more MUST continue to accumulate into the hours component rather than
  introducing a day unit: `90061000` renders as `25h 1m 1s`.
  *See Assumption A1 — this requires manager confirmation.*

- **FR-009 (Defensive input handling)** — Consistent with the non-throwing house
  style of the surrounding module, the helper MUST return `"0s"` when the input
  is negative, non-finite (`NaN`, `Infinity`, `-Infinity`), or not a number.
  *See Assumptions A2 and A3.*

---

## Edge Cases

| Input | Output | Requirement |
|---|---|---|
| `999` | `"0s"` | FR-003, FR-006 |
| `59999` | `"59s"` | FR-003 |
| `1500.7` | `"1s"` | FR-003 — non-integer input needs no special case |
| `7205000` | `"2h 5s"` | FR-005 — interior zero |
| `3600000` | `"1h"` | FR-005 — both lower units zero |
| `90061000` | `"25h 1m 1s"` | FR-008 — hours accumulate past a day |
| `-5000` | `"0s"` | FR-009 |
| `NaN` / `Infinity` | `"0s"` | FR-009 |
| `null` / `undefined` / `"abc"` | `"0s"` | FR-009 |

---

## Clarifications

### Session 2026-09-04 (manager, in conversation)

- **Q: How should partial seconds be handled, and what about sub-second inputs?**
  A: "Round to whole seconds, and don't show a unit that is zero — so `90000` is
  `1m 30s` but `60000` is just `1m`. Under a second, say `0s`."

- **Follow-up raised by SPEC-AUTHOR:** the word "round" and the "under a second
  → `0s`" rule are in tension. Nearest-rounding renders `700` as `1s`, which
  violates the `0s` rule; truncation satisfies every stated example. Truncation
  was proposed as the reading.
  **A: Confirmed by the manager** ("That's right"). Recorded as FR-003.

- **Not yet answered:** units above minutes (see Assumption A1). The manager
  directed that the spec be written without waiting on this answer, so it is
  recorded as a flagged assumption rather than a blocker.

---

## Assumptions

Decisions made by SPEC-AUTHOR in the absence of an explicit instruction. A1 is
the only one that changes visible output for realistic inputs.

- **A1 — Hours exist; days do not. ⚠️ NEEDS CONFIRMATION.** The request only
  demonstrated minutes and seconds. Extending to hours is assumed because
  minute-only output degrades badly for long durations (`3661000` would read
  `61m 1s`). Days are assumed *not* to exist, to keep the helper small. If the
  manager wants either minute-capped output or a day unit, **FR-008 and
  acceptance scenarios 8–9 must change.**

- **A2 — Negative input yields `"0s"` rather than throwing or sign-prefixing.**
  A negative duration is a caller error, but the surrounding module is
  non-throwing throughout (`displayName` returns `""` for a null user; `clamp`
  never throws), so clamping to zero matches house style.

- **A3 — Non-finite and non-numeric input yields `"0s"`.** Same house-style
  reasoning as A2. This is deliberately lossy: it favors a usable log line over
  a crash in display code. If callers need to distinguish "zero duration" from
  "bad input," that is a different function and out of scope.

- **A4 — Placement in `src/format.js` as a named ESM export.** Inferred from the
  existing `formatBytes` export in that file and the repo-wide named-export
  convention. Tests are assumed to follow the established
  `tests/<name>.test.js` layout, i.e. `tests/format-duration.test.js`.

- **A5 — ASCII, English, single-character unit suffixes.** No localization, no
  pluralization, no long-form ("2 minutes 30 seconds"). Consistent with
  `formatBytes`, which emits fixed ASCII unit labels.

---

## Out of Scope

- Parsing a duration string back into milliseconds.
- Localization, translation, or `Intl`-based formatting.
- Long-form or pluralized output (`2 minutes 30 seconds`).
- Days, weeks, or calendar-aware units (see A1).
- Sub-second precision — milliseconds are never displayed.
- Padded or clock-style output (`00:02:30`).
- Measuring elapsed time; the caller supplies the value.

---

## Review & Acceptance Checklist

- [x] Every example given by the manager appears as an acceptance scenario
- [x] The truncation-vs-rounding contradiction is resolved and its derivation recorded
- [x] Zero-unit suppression is specified for leading, interior, and trailing units
- [x] The all-zero case is specified and its precedence over suppression is stated
- [x] Invalid and out-of-range inputs have defined behavior
- [x] Assumptions are separated from confirmed requirements
- [x] Requirements are behavioral and testable; no implementation prescribed
- [ ] **A1 (hours cap) confirmed by the manager** — the one open item
- [ ] Constitution compliance re-checked once `.specify/memory/constitution.md` is readable (see note)

---

## Notes

The governing constitution (`.specify/memory/constitution.md`) and the format
exemplar (`specs/001-phase-1-walking-skeleton/spec.md`) are both registered in
the Mission Control ledger but were **unreadable from this worktree** at
authoring time (`read_doc` returned `unknown_task` on two attempts, for both
`kind: constitution` and `kind: spec`). This document therefore follows standard
Spec-Kit structure. If the project constitution mandates a different section
layout, this spec should be re-shaped to match — no requirement above depends on
that layout.
