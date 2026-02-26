# Cron Reliability Report

Generated: 2026-02-26T02:04:24.279Z
Runs sampled per job: 5

## Summary
- Jobs total: 9
- Healthy: 6
- Warn: 3
- Critical: 0
- Reliability score: **72/100**

## Job table
| Job | Enabled | Health | Last run | Last delivery | Consecutive errors | Last run at | Reasons |
|---|---|---|---|---|---:|---|---|
| `ns01-opus-cache-24h-checkpoint` | yes | warn | unknown | unknown | 0 | n/a | delivery_status=unknown |
| `ops-cost-report-weekly` | yes | warn | unknown | unknown | 0 | n/a | delivery_status=unknown |
| `daily-standup` | yes | warn | ok | delivered | 0 | 2026-02-26T01:07:29.631Z | recent_error_runs=1/4 |
| `hammerspoon-cleanup` | yes | healthy | ok | not-delivered | 0 | 2026-02-26T01:34:55.212Z | none |
| `check-drop-folder` | yes | healthy | ok | not-delivered | 0 | 2026-02-26T01:57:09.225Z | none |
| `discord-health-check` | yes | healthy | ok | not-delivered | 0 | 2026-02-26T01:44:00.135Z | none |
| `Update OpenClaw updates feed` | yes | healthy | ok | delivered | 0 | 2026-02-25T07:15:00.008Z | none |
| `ops-security-audit-daily` | yes | healthy | ok | delivered | 0 | 2026-02-26T01:13:11.134Z | none |
| `ops-drift-report-nightly` | yes | healthy | ok | delivered | 0 | 2026-02-26T01:20:00.012Z | none |

## Immediate actions
1. Address warning jobs: token/trusted routing, delivery statuses, and stale schedule drift.

## Notes
- This score is an operational heuristic, not a formal SLA measure.
- Use with run logs and channel delivery traces for root-cause analysis.
