# GAP-20260226-003 Cron Reliability Monitor

Status: Active build kickoff (2026-02-26)

## Goal
Detect cron reliability issues early by scoring job health and surfacing failure patterns:
- repeated errors
- delivery failures
- stale execution windows
- noisy or unstable jobs

## Contents
- `SPEC.md` - scope and acceptance criteria.
- `scripts/cron-reliability-report.mjs` - generates reliability report from live cron state/runs.
- `reports/cron-reliability-latest.md` - latest generated report.
- `checklists/release-packet.md` - required launch assets.

## Quick start
```bash
node scripts/cron-reliability-report.mjs
```

Optional:
```bash
node scripts/cron-reliability-report.mjs --runs-limit 5 --output reports/cron-reliability-latest.md
```

## Scoring model (v1)
- Start at `100`.
- Subtract per-job penalties and clamp at `0`.
- Penalty signals include: disabled jobs, consecutive errors, last run error status, delivery unknown/failed, missing next run, stale execution windows, and recent error runs.
- Current score formula is intentionally simple and operational, not SLA-grade.

## Health buckets
- `healthy`: no active reliability penalties.
- `warn`: non-fatal risk indicators present (for example delivery unknown, stale schedule behavior, recent error runs).
- `critical`: hard failure indicators present (for example consecutive errors or last run status `error`).

## Operational limits
- Single-gateway view only (no cross-profile aggregation in v1).
- Report is a point-in-time snapshot; long-term trend storage is out of scope.
- Script surfaces priorities but does not apply automatic remediation.
