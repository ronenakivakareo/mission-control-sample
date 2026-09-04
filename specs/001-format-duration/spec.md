# Feature Specification: `formatDuration(ms)`

**Feature branch:** `001-format-duration`
**Created:** 2026-09-04
**Status:** Ready for planning
**Input:** Manager description — "a `formatDuration(ms)` helper in `src/` that turns a
millisecond count into something readable like `2m 30s`."

---

## User Scenario

A developer has a duration in milliseconds — an elapsed timer, a job runtime, a
timeout value — and needs to show it to a person. Raw milliseconds (`150000`) are
unreadable at a glance. The developer calls `formatDuration(150000)` and gets
`"2m 30s"`, a compact string that can be dropped straight into a log line, a CLI
output, or a UI label without further massaging.

### Acceptance Scenarios

1. **Given** a duration of 150000 ms, **when** `formatDuration` is called,
   **then** it returns `"2m 30s"`.
2. **Given** a duration of 90000 ms, **when** `formatDuration` is called,
   **then** it returns `"1m 30s"`.
3. **Given** a duration of 60000 ms (a whole number of minutes), **when**
   `formatDuration` is called, **then** it returns `"1m"` — the zero-valued
   seconds unit is omitted, not rendered as `"1m 0s"`.
4. **Given** a duration under one second, **when** `formatDuration` is called,
   **then** it returns `"0s"`.
5. **Given** a duration of 3601000 ms (one hour, zero minutes, one second),
   **when** `formatDuration` is called, **then** it returns `"1h 1s"` — an
   interior zero-valued unit is omitted too.

---

## Functional Requirements

- **FR-001** The system MUST expose a function `formatDuration(ms)` that accepts a
  duration in milliseconds and returns a human-readable string.
- **FR-002** Any input under 1000 ms MUST render as `"0s"` (per C-003); this rule
  takes precedence over rounding. Inputs of 1000 ms or more MUST be rounded to the
  nearest whole second, with halves rounding up. Sub-second precision is never
  displayed.
- **FR-003** The system MUST round to whole seconds **before** decomposing the
  value into units, so that a rounded-up value carries correctly into the next
  unit (see FR-006 and the 59999 ms edge case).
- **FR-004** The system MUST decompose the rounded value into hours, minutes, and
  seconds, and render each present unit as an integer immediately followed by its
  suffix — `h`, `m`, `s` — with single spaces between units.
- **FR-005** The system MUST omit any unit whose value is zero, including units
  interior to the string. `60000` renders as `"1m"`, never `"1m 0s"`; `3601000`
  renders as `"1h 1s"`, never `"1h 0m 1s"`.
- **FR-006** The system MUST return `"0s"` for any duration that renders as zero
  seconds — that is, any input under 1000 ms (FR-002). This is the one case where
  a zero-valued unit is displayed, because a duration must never render as an
  empty string.
- **FR-007** Hours MUST be the largest unit. A duration of 25 hours renders as
  `"25h"`; the value MUST NOT be promoted to days or weeks.
- **FR-008** Hours MUST NOT be capped or truncated — the hours component grows
  without bound rather than saturating at some maximum.

### Edge Cases

| Input (ms) | Output | Why |
| --- | --- | --- |
| `0` | `"0s"` | FR-006 — never an empty string |
| `999` | `"0s"` | C-003 override — under 1000 ms, so **not** rounded up to `"1s"` |
| `1000` | `"1s"` | Smallest non-zero output |
| `1499` | `"1s"` | Rounds down to 1 s |
| `1500` | `"2s"` | Rounds up to 2 s |
| `59999` | `"1m"` | Rounds to 60 s, **then** decomposes — carries to `"1m"`, not `"60s"` |
| `60000` | `"1m"` | Zero seconds suppressed |
| `90000` | `"1m 30s"` | Manager-confirmed example |
| `150000` | `"2m 30s"` | Manager-confirmed example |
| `3600000` | `"1h"` | Zero minutes and seconds both suppressed |
| `3601000` | `"1h 1s"` | Interior zero unit suppressed |
| `3660000` | `"1h 1m"` | Trailing zero unit suppressed |
| `3661000` | `"1h 1m 1s"` | All three units present |
| `9000000` | `"2h 30m"` | 2.5 h uses hours, not `"150m"` (FR-007) |
| `90000000` | `"25h"` | Hours are not promoted to days (FR-007) |
| `NaN`, `Infinity`, non-numeric | `"0s"` | Assumption A-002 |
| negative values | `"0s"` | Assumption A-002 |

---

## Clarifications

Resolved with the manager during the clarify loop:

- **C-001** Durations are rounded to **whole seconds**; sub-second precision is
  never shown.
- **C-002** A unit whose value is zero is **not displayed**. `90000` is
  `"1m 30s"` but `60000` is just `"1m"`.
- **C-003** Anything under one second renders as `"0s"`.

## Assumptions

Decided during authoring and recorded rather than escalated. Each is cheap to
reverse.

- **A-001 — Hours are the largest unit; days are not used.** The manager's
  example only demonstrated minutes and seconds, leaving the ceiling open. Hours
  are included because capping at minutes would render 2.5 hours as `"150m"`,
  which defeats the purpose of a readability helper. Days are excluded to keep
  the output unambiguous — `"1d 2h"` invites questions about calendar days that a
  pure elapsed-time formatter should not have to answer. **This is the assumption
  most worth a second look; reversing it changes FR-007 and two table rows only.**
- **A-002 — Invalid, non-finite, and negative inputs return `"0s"`.** A display
  helper should not throw and blow up a log line or a render. Returning the same
  degenerate-but-valid string as a zero duration keeps every call site free of
  defensive branching. If callers need to distinguish "no data" from "zero
  elapsed", that is a separate feature.
- **A-003 — No localisation, no pluralisation, no long-form units.** The suffixes
  are the fixed ASCII forms `h`/`m`/`s`, matching the compact style the manager
  asked for. Long forms like `"2 minutes 30 seconds"` are out of scope.

---

## Repo Integration Context

Sourced from the manager's description (`src/`) and the conventions already in the
repository. Recorded for the planning step; not a design mandate.

- **Placement:** `src/format.js`, beside the existing `formatBytes`. That module is
  already the home for human-readable formatting helpers and documents its
  team convention in a header comment; `formatDuration` fits the same pattern.
- **Export style:** a named ESM export (`export function formatDuration`),
  matching `formatBytes` and the repo's `"type": "module"` setting.
- **Verification:** `tests/format-duration.test.js`, using `node:test` and
  `node:assert/strict` as the existing tests under `tests/` do. `npm test` runs
  `node --test tests/`, and CI runs the same command on every pull request. The
  edge-case table above is written to be used directly as test cases.

## Out of Scope

- Parsing strings back into millisecond counts.
- Days, weeks, or calendar-aware units (see A-001).
- Localisation, translation, or pluralised long-form units (see A-003).
- Sub-second precision in the output (see C-001).
- Changing `formatBytes` or any existing helper.

---

## Review Checklist

- [x] Every functional requirement is testable
- [x] Manager clarifications recorded (C-001 – C-003)
- [x] Assumptions recorded with rationale (A-001 – A-003)
- [x] No unresolved `[NEEDS CLARIFICATION]` markers
- [x] Scope boundaries stated
