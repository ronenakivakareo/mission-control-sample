# mission-control-sample

A **disposable** target repository for Mission Control Phase 1 acceptance runs
(SC-002, SC-005, SC-007).

## What this is for

Mission Control's agent team does real work here: it claims tasks, opens pull
requests on `mc/task-{id}` branches, and a human approves the merge from the
Inbox. Everything that happens is recorded as ledger events in Mission Control.

## Ground rules

- **Never put customer data, PHI, or secrets in this repo.** Mission Control
  records artifact references from it into an append-only ledger that cannot be
  redacted afterwards (constitution Principle VII / FR-007).
- **The default branch is protected, including for administrators.** That is a
  requirement, not a preference: merge authority has to be enforced by branch
  protection rather than by the dashboard being polite about it (FR-031,
  Principle II). A direct push to it should be rejected — if it succeeds, SC-005
  cannot pass and the Approve button is decorative.
- Agents may push **only** to `mc/task-{id}` branches (FR-030). That pattern is
  also how CI check runs are correlated back to a task (R-010).

## Running the tests

```bash
npm test
```

CI runs the same command on every pull request. The check-run conclusion is what
resolves Mission Control's `test` gate — a repo with no CI leaves every task
stuck at `pending`.
