# Pre-registered intervention: the admission gate reads only metadata, never the gap's own prose

**Window opened** 2026-09-06 11:25 UTC. **Load average during measurement** 16–21 — high enough
that no *landed-code verdict* from this window may be treated as anything but INCONCLUSIVE. The
claims below are about *data state and selection*, which load does not perturb.

## The retraction that started it

I published, earlier in this session, that the two bootstrap gaps filed at 11:11 were unattempted
because of **capacity starvation**, citing:

```
[substrate-gap] gap-compose unit NOT started for no-reconciler-checks-... — a compose is already in flight
```

**That was wrong.** The picker's own admission line settles it:

```
[gap-to-feature] auto-pick admission: 747 candidates → 370 admitted, 377 excluded
                 {"orphan_no_producer":2,"no_groundable_target":375}
```

Both gaps sat in `no_groundable_target`. They were **excluded by construction**, not starved.
`citedExistingFile` (`repos/development-vessel/src/resolvers/gap-to-feature.ts:1290`) reads exactly
four metadata fields — `edit_site`, `file_path`, `change_site`, `suspected_real_location` — and
never reads the summary. Both gaps carried `target_file: null`. A gap can name its target in the
first sentence of its summary and remain invisible to the lane forever.

## The measurement

Against the live store, 2026-09-06 11:45 UTC, 802 open gaps:

| class | count |
|---|---|
| groundable by metadata today | 371 |
| **not groundable by metadata, but summary prose names an EXISTING file** | **74** |
| names no existing file anywhere (creation gaps + vague) | 357 |

74 actionable gaps — a **20% increase on the workable inventory** — are excluded every tick behind
a parse the system already performs elsewhere. `goal-host-vessel/src/index.ts` (gap-hydration)
runs `/repos\/[\w.-]+\/[\w.\/-]+\.\w+/` over `metadata + summary` and logs `cited file: <path>`;
it succeeded twice within twenty minutes. It injects the parsed path into **goal text only** and
never writes it back to the record, so the picker stays blind to a path the system already
extracted.

## The intervention, and its pre-registered prediction

**Changed:** exactly one property of two gap records — `classification_metadata.edit_site` stamped
with an existing file. No code landed. Full-record resend, because `substrateGap_write` REPLACES
rather than merges.

**Predicted, before observing:** `citedExistingFile` returns non-null → the gap is admitted on the
next tick → it becomes *eligible* to be picked. Admission was predicted; **being picked was not**,
since rank still competes against `route-edit-*` at 0.84.

**Observed:**

| time | event |
|---|---|
| 11:11–11:49 | `compose-grades-...` filed, ungrounded. **Never picked. 38 minutes.** |
| ~11:49 | `edit_site` stamped on both gaps |
| 11:53:38 | `[gap-to-feature] pick {"gap_id":"compose-grades-are-keyed-to-clean-exit-not-to-consequence", "target":"repos/development-vessel/src/resolvers/feature-compose.ts","score":0.84}` |

Four minutes from grounding to the top slot, after 38 minutes of invisibility. One property
changed; one observable change; the prediction was made in advance and was, if anything,
conservative.

## What step 3 actually is — one line

The gap was re-authored as a single verbatim op after reading the emission site.
`feature-compose.ts:6191`:

```ts
        success: verdict === "FAVORABLE",
```

That is the compose grade. Not landed, not pushed, not executed — the gate verdict alone.
`landedVessels` is computed **three lines above** it (from `cutovers` filtered on
`result.applied === true`) and is already persisted into the *same trace* as
`metadata.landed_vessels`. **The trace carries the refutation of its own grade and does not
consult it.** The op is one line:

```ts
        success: verdict === "FAVORABLE" && landedVessels.length > 0,
```

Stated consequence, so the effect is not later mistaken for a regression: emission is
unconditional and stays so, preserving step 1's result; only the *label* changes; and the measured
success rate on `feature_compose` will **fall**, because most composes do not land. That fall is
the correction — the rate that drops was never measuring repair.

## Two claims tested and NOT published

- **"The substrate has never autonomously created a new resolver."** Over-determined and narrowed.
  `50fc392` is substrate-authored and *did* add a new file — but it was admitted on an
  **existing** `edit_site` (`gap-to-feature.ts`) and created `gap-to-feature.test.ts` as a sibling
  op. The accurate claim: creation is reachable only once a gap is grounded on a file that already
  exists. All 357 gaps naming only a not-yet-existing file remain structurally inadmissible.
- **"`impact` is a constant, so the picker ranks only by landability."** Refuted by a control over
  653 pick lines / 3 days: `impact` takes 1 (589), 1.25 (35), 1.5 (13), 1.75 (10), 2 (6). It is
  the *mode*, not a constant. `score == landability` in 423 of 653 (65%).
- **"The picker does not choose its top-scoring candidate" (322 of 653, 49%).** Refuted by reading
  the code. `chosen` comes from `chooseFirstActionable(ranked, …)` — the first candidate not
  skipped as pending-verification — while `runner_up` is hardcoded `ranked[1]` of the *unfiltered*
  list. With `skipped_pending: 40` on the same line, a runner-up outscoring the pick is expected.

  What survives is smaller and real: a log line whose stated purpose is *law 12 — record the
  counterfactual AT decision time* names, in roughly half of all decisions, an alternative that
  was never selectable. The system's own record of "what I would have done instead" is wrong 49%
  of the time. **Not filed as a gap**, deliberately: the pool is at 315 with `tied_at_top: 7`, and
  the surrounding code already warns that new low-priority filings are "a new amplification input
  into the very gap store this work is trying to drain."

## Standing observations, not yet acted on

- `gap-compose.service` is, since the 2026-07-09 watchdog demotion, a **stall detector**, not the
  compose path (`ExecStart=…/watchdog-tick.ts`, resolved via `systemctl show`). Every
  `[substrate-gap] event-driven gap-compose pickup triggered by <gap>` line therefore starts a unit
  that exits in under a second when the flow is alive. The mechanism is coherent and documented;
  the **log line names a pickup that structurally is not one**.
- `[oracle-label] NOT consumed exec=exec_zkzgshr9 reason=no_labels` repeats every ~2 seconds for a
  single execution id — a hot retry loop against a condition that cannot change without a labeler.
