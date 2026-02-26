# Cron Reliability Report

Generated: 2026-02-26T11:37:51.790Z
Runs sampled per job: 3

## Summary
- Jobs total: 15
- Healthy: 14
- Warn: 1
- Critical: 0
- Reliability score: **92/100**

## Job table
| Job | Enabled | Health | Last run | Last delivery | Consecutive errors | Last run at | Reasons |
|---|---|---|---|---|---:|---|---|
| `daily-standup` | yes | warn | ok | delivered | 0 | 2026-02-26T01:07:29.631Z | recent_error_runs=1/3 |
| `check-drop-folder` | yes | healthy | ok | not-delivered | 0 | 2026-02-26T11:27:09.787Z | none |
| `discord-health-check` | yes | healthy | ok | not-delivered | 0 | 2026-02-26T10:44:00.221Z | none |
| `hammerspoon-cleanup` | yes | healthy | ok | not-delivered | 0 | 2026-02-26T11:34:55.398Z | none |
| `self-review-4h` | yes | healthy | unknown | unknown | 0 | n/a | none |
| `rick-intake-promote` | yes | healthy | ok | not-delivered | 0 | 2026-02-26T10:01:34.717Z | none |
| `ops-cost-alert-daily` | yes | healthy | ok | not-delivered | 0 | 2026-02-26T09:58:31.818Z | none |
| `daily-cost-alert` | yes | healthy | unknown | unknown | 0 | n/a | none |
| `ns01-opus-cache-24h-checkpoint` | yes | healthy | unknown | unknown | 0 | n/a | none |
| `ops-security-audit-daily` | yes | healthy | ok | delivered | 0 | 2026-02-26T01:13:11.134Z | none |
| `ops-drift-report-nightly` | yes | healthy | ok | delivered | 0 | 2026-02-26T01:20:00.012Z | none |
| `Update OpenClaw updates feed` | yes | healthy | ok | delivered | 0 | 2026-02-26T07:15:00.010Z | none |
| `ops-fact-sync-weekly` | yes | healthy | unknown | unknown | 0 | n/a | none |
| `ops-cost-report-weekly` | yes | healthy | unknown | unknown | 0 | n/a | none |
| `ops-action-log-weekly` | yes | healthy | unknown | unknown | 0 | n/a | none |

## Immediate actions
1. Address warning jobs: token/trusted routing, delivery statuses, and stale schedule drift.

## Notes
- This score is an operational heuristic, not a formal SLA measure.
- Use with run logs and channel delivery traces for root-cause analysis.
