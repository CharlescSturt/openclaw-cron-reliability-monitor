# SPEC - Cron Reliability Monitor (v1)

Gap ID: `GAP-20260226-003`  
Date: 2026-02-26  
Owner: Charles

## Problem
Cron jobs are central to autonomous behavior, but failures can remain unnoticed until downstream damage accumulates.

## v1 scope
1. Pull live cron state from OpenClaw (`cron list` + per-job run history).
2. Compute job-level health classification (`healthy | warn | critical`).
3. Compute an overall reliability score (0-100) with transparent penalty rules.
4. Emit markdown report suitable for human review and daily standups.

## Non-goals (v1)
1. Automatic cron remediation.
2. Cross-gateway aggregation.
3. Long-term time series storage beyond generated report snapshots.

## Functional requirements
1. Script must detect:
- consecutive error streaks
- last run status
- delivery failures
- stale/unscheduled jobs with missing next run

2. Report must include:
- overall score
- issue summary counts
- per-job table with last status and health bucket
- immediate action list

## Acceptance criteria
1. Script runs against current Charles gateway and produces markdown report.
2. Existing known cron issue(s) appear in report classification.
3. Report can be referenced as evidence in North Star tracker.

## Release criteria
1. README + usage complete.
2. Report example captured.
3. Release checklist complete.
