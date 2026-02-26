#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseArgs(argv) {
  const args = {
    runsLimit: 3,
    output: path.join(__dirname, "..", "reports", "cron-reliability-latest.md"),
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--runs-limit") {
      args.runsLimit = Number(argv[i + 1]);
      i += 1;
    } else if (arg === "--output") {
      args.output = argv[i + 1];
      i += 1;
    } else if (arg === "--help" || arg === "-h") {
      console.log(
        "Usage: node cron-reliability-report.mjs [--runs-limit 3] [--output reports/cron-reliability-latest.md]",
      );
      process.exit(0);
    } else {
      throw new Error(`Unknown arg: ${arg}`);
    }
  }

  if (!Number.isFinite(args.runsLimit) || args.runsLimit < 1) {
    throw new Error("Invalid --runs-limit value");
  }

  return args;
}

function runJson(cmd) {
  const raw = execSync(cmd, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 30000,
  });
  return JSON.parse(raw);
}

function getCronJobs() {
  const data = runJson("openclaw cron list --json");
  return Array.isArray(data.jobs) ? data.jobs : [];
}

function getRuns(jobId, limit) {
  try {
    const data = runJson(`openclaw cron runs --id ${jobId} --limit ${limit}`);
    return Array.isArray(data.entries) ? data.entries : [];
  } catch {
    return [];
  }
}

function classify(job, runs, nowMs) {
  const st = job.state || {};
  const enabled = job.enabled !== false;
  const consecutiveErrors = Number(st.consecutiveErrors || 0);
  const lastRunStatus = st.lastRunStatus || st.lastStatus || "unknown";
  const lastDeliveryStatus = st.lastDeliveryStatus || "unknown";
  const deliveryMode = job?.delivery?.mode || "none";
  const nextRunAtMs = Number(st.nextRunAtMs || 0);
  const lastRunAtMs = Number(st.lastRunAtMs || 0);

  let health = "healthy";
  const reasons = [];
  let penalty = 0;

  if (!enabled) {
    health = "warn";
    reasons.push("disabled");
    penalty += 10;
  }

  if (consecutiveErrors > 0) {
    health = "critical";
    reasons.push(`consecutive_errors=${consecutiveErrors}`);
    penalty += Math.min(40, 15 + consecutiveErrors * 5);
  }

  if (lastRunStatus === "error") {
    health = "critical";
    reasons.push("last_run_status=error");
    penalty += 25;
  }

  const deliveryUnknownOrFailed =
    lastDeliveryStatus === "unknown" || lastDeliveryStatus === "failed";
  const neverRanYet = lastRunAtMs <= 0;
  const notDueYet = nextRunAtMs > nowMs;

  if (
    deliveryMode !== "none" &&
    deliveryUnknownOrFailed &&
    !(neverRanYet && notDueYet)
  ) {
    if (health !== "critical") health = "warn";
    reasons.push(`delivery_status=${lastDeliveryStatus}`);
    penalty += 10;
  }

  if (enabled && nextRunAtMs <= 0) {
    if (health !== "critical") health = "warn";
    reasons.push("missing_next_run");
    penalty += 10;
  }

  if (enabled && lastRunAtMs > 0 && nextRunAtMs > 0) {
    const lag = nowMs - lastRunAtMs;
    const scheduleEveryMs = Number(job?.schedule?.everyMs || 0);
    if (scheduleEveryMs > 0 && lag > scheduleEveryMs * 3) {
      if (health !== "critical") health = "warn";
      reasons.push("stale_execution_window");
      penalty += 12;
    }
  }

  if (runs.length > 0) {
    const errorRuns = runs.filter((r) => r.status === "error").length;
    if (errorRuns > 0 && health !== "critical") {
      health = "warn";
      reasons.push(`recent_error_runs=${errorRuns}/${runs.length}`);
      penalty += 8;
    }
  }

  return {
    id: job.id,
    name: job.name || job.id,
    enabled,
    health,
    reasons,
    penalty,
    lastRunStatus,
    lastDeliveryStatus,
    consecutiveErrors,
    nextRunAtMs,
    lastRunAtMs,
  };
}

function toIso(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return "n/a";
  return new Date(ms).toISOString();
}

function buildReport(classifications, jobs, generatedAt, runsLimit) {
  const totalJobs = classifications.length;
  const healthy = classifications.filter((c) => c.health === "healthy");
  const warn = classifications.filter((c) => c.health === "warn");
  const critical = classifications.filter((c) => c.health === "critical");

  const totalPenalty = classifications.reduce((sum, c) => sum + c.penalty, 0);
  const reliabilityScore = Math.max(0, 100 - totalPenalty);

  const sorted = [...classifications].sort((a, b) => {
    const severityRank = { critical: 0, warn: 1, healthy: 2 };
    const bySeverity = severityRank[a.health] - severityRank[b.health];
    if (bySeverity !== 0) return bySeverity;
    return b.penalty - a.penalty;
  });

  const table = sorted
    .map(
      (c) =>
        `| \`${c.name}\` | ${c.enabled ? "yes" : "no"} | ${c.health} | ${c.lastRunStatus} | ${c.lastDeliveryStatus} | ${c.consecutiveErrors} | ${toIso(c.lastRunAtMs)} | ${c.reasons.join(", ") || "none"} |`,
    )
    .join("\n");

  const actions = [];
  if (critical.length > 0) {
    actions.push("Fix critical jobs first: inspect `lastError`, delivery channel settings, and model/auth routing.");
  }
  if (warn.length > 0) {
    actions.push("Address warning jobs: token/trusted routing, delivery statuses, and stale schedule drift.");
  }
  if (critical.length === 0 && warn.length === 0) {
    actions.push("All jobs healthy; keep daily report cadence and weekly trend review.");
  }

  return `# Cron Reliability Report

Generated: ${new Date(generatedAt).toISOString()}
Runs sampled per job: ${runsLimit}

## Summary
- Jobs total: ${totalJobs}
- Healthy: ${healthy.length}
- Warn: ${warn.length}
- Critical: ${critical.length}
- Reliability score: **${reliabilityScore}/100**

## Job table
| Job | Enabled | Health | Last run | Last delivery | Consecutive errors | Last run at | Reasons |
|---|---|---|---|---|---:|---|---|
${table || "| n/a | n/a | n/a | n/a | n/a | 0 | n/a | n/a |"}

## Immediate actions
${actions.map((line, i) => `${i + 1}. ${line}`).join("\n")}

## Notes
- This score is an operational heuristic, not a formal SLA measure.
- Use with run logs and channel delivery traces for root-cause analysis.
`;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const nowMs = Date.now();
  const jobs = getCronJobs();

  const classifications = jobs.map((job) => {
    const runs = getRuns(job.id, args.runsLimit);
    return classify(job, runs, nowMs);
  });

  const report = buildReport(classifications, jobs, nowMs, args.runsLimit);
  fs.mkdirSync(path.dirname(args.output), { recursive: true });
  fs.writeFileSync(args.output, report, "utf8");
  console.log(`Wrote report: ${args.output}`);
}

try {
  main();
} catch (err) {
  console.error(`Failed: ${err.message}`);
  process.exit(1);
}
