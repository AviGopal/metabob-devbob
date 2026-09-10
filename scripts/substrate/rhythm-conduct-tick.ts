/**
 * rhythm-conduct-tick.ts — run the rhythm conductor from the bootstrap tier.
 *
 * WHY THIS EXISTS. `rhythm_conductor_tick` is the component that reads the rhythm
 * registry, scores each family's due-ness and enqueues what is due. It was registered
 * only as `satisfier:rhythm_conductor_tick` — a Thompson-selected activity — so it ran
 * when selection happened to pick it: **11 executions ever**, the last 53 hours before
 * this file was written. Cadence therefore depended on the selection drift it exists to
 * correct, and when it stopped it emitted silence, which reads as health.
 *
 * CLAUDE.md already states the principle, as its reason for exempting the liveness
 * watchdogs from the script-retention rule: "a check cannot be scheduled by the mechanism
 * it exists to recover." A SCHEDULER cannot be scheduled by the thing it schedules. This
 * is that stated bootstrap-tier exception, not a new carve-out.
 *
 * IT PRINTS THE COUNTS, DELIBERATELY. The conductor can decline every rhythm and return
 * `considered: 11, enqueued: [], skipped: []` — from outside, "nothing was due",
 * "everything was unaffordable" and "it crashed" are indistinguishable. Putting
 * considered/enqueued/skipped/bucket_load in the journal makes an idle tick legible as
 * idle rather than as absent.
 *
 * Read-only with respect to source; its only effects are the conductor's own enqueues.
 */

const DEV = process.env["DEV_VESSEL_ENDPOINT"] || process.env["DEVELOPMENT_VESSEL_URL"] || "http://127.0.0.1:8090";
const RESOLVE = DEV.replace(/\/$/, "") + "/v2/impulses/resolve";

async function main(): Promise<void> {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), 30_000);
  try {
    const r = await fetch(RESOLVE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ impulse: { type: "rhythm_conductor_tick" } }),
      signal: c.signal,
    });
    const j = (await r.json()) as { body?: Record<string, unknown> };
    const b = j?.body ?? {};
    const enq = Array.isArray(b["enqueued"]) ? (b["enqueued"] as unknown[]) : [];
    const skip = Array.isArray(b["skipped"]) ? (b["skipped"] as unknown[]) : [];
    const load = b["bucket_load"];
    const ceiling = typeof load === "number" ? (1 - load / 3).toFixed(3) : "?";
    console.log(
      `[rhythm-conduct] considered=${b["considered"] ?? "?"} enqueued=${enq.length} skipped=${skip.length} ` +
        `drained=${b["drained"] ?? "?"} bucket_load=${load ?? "?"} affordability_ceiling=${ceiling}`,
    );
    if (enq.length > 0) console.log(`[rhythm-conduct] enqueued: ${JSON.stringify(enq).slice(0, 400)}`);
    if (skip.length > 0) console.log(`[rhythm-conduct] skipped: ${JSON.stringify(skip).slice(0, 400)}`);
    // An idle tick is the expected steady state, but say so rather than exiting silent.
    if (enq.length === 0 && skip.length === 0) {
      console.log(
        `[rhythm-conduct] nothing enqueued and nothing recorded as skipped — either no family was due, ` +
          `or every due family was priced out by the affordability ceiling. The conductor does not report ` +
          `a per-family reason, so this line is the only record that the tick ran at all.`,
      );
    }
  } finally {
    clearTimeout(t);
  }
}

main().catch((e) => {
  console.error("[rhythm-conduct] failed:", e instanceof Error ? e.message : String(e));
  process.exit(1);
});
