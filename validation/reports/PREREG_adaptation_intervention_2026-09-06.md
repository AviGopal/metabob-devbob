# Pre-registration — can first-mile adaptation be made to fire at all?

Goal window opened 04:53:18 UTC. This is a **deliberate intervention** (law 12) rather than another
correlation over traces: change one thing, state the expectation first, record that it was changed.

## What the measurement so far establishes

Tier-2 lexical rebind has fired **0 times in 462 calls over 24h**. The refusal totals, across every
candidate examined:

| refusal | count |
|---|---|
| `shape-mismatch` | 54,906 |
| `scaffold-too-weak` | 1,762 (median ratio **0.060**, max 0.15) |
| `slot-gate-rejected` | **699** |
| **selected=true** | **0** |

**The obvious fix is refuted.** Lowering the scaffold threshold (already lowered 0.5 → 0.25 → 0.15,
each time from measurement) would only move more candidates into the literal gate — which already
sees 699 and rejects **100%** of them. The author's own comment predicted this: once
`slot-gate-rejected` appears, "the answer moves from retrieval to what gets banked."

**`shape-mismatch` is a misleading 97% of the tally.** It is counted per candidate scanned, so a
goal whose shape has no donor reports `shape-mismatch × cache-size`. That reads as "many refusals"
when it means "this mechanism does not apply here."

**And for most demand it genuinely does not apply.** Shapes demanded by rebind calls in 24h vs
donors in the library:

| demanded shape | calls | donors banked |
|---|---|---|
| `fs_edit` | 67 | **0** |
| `code_modification_proposal` | 55 | **0** |
| `shellResult` | 31 | 1,730 |
| `substrateGap_write` | 27 | 0 |
| `webSearchResult` | 25 | 16 |

Only command-shaped results are ever banked (`REBIND_EXEC_FIELDS = command, cmd, script, sql`), so
for the two largest demand classes lexical rebind is **structurally inapplicable**, not unlucky.

The library itself is only partly adaptable: of 993 live donors (4,633 lines, **2,540 tombstones**),
**32.3% contain no token of their own goal text in the command**, median share 0.11.

## What pathway reuse shows (a correction)

Distinct mechanism, and it does fire: `walk_tier = learned_pathway` on **702 walks (7.1%)**. Of the
21 rows carrying reuse lineage, **18 borrowed from a DIFFERENT goal_hash** — genuine cross-goal
adaptation — and 7 have `successful_executions > 0`.

⚠ **A control prevented a false finding here.** All 21 rows have `success: None`, which looked like
"adaptation is never graded". The control showed `success` is None on **all 9,864 rows** — an unused
field. The real grading signal is `successful_executions`. The lineage field only began recording
2026-08-29, so 21 rows is the whole population, and 696 of the 702 `learned_pathway` walks record
nothing about what they borrowed from.

## The intervention

Three goals, in order. A is the donor; B is a positive control; C is the real case.

- **A (donor)** — `Count the number of lines in the file /vessels/activity-api/src/routes/db-admin-repair.ts and report the count.`
- **B (positive control)** — same sentence, one slot changed to `.../goal-paths.ts`. Maximal
  lexical scaffold, path appears exactly once in any plausible command.
- **C (real case)** — the same task phrased differently: `How many lines does
  /vessels/activity-api/src/routes/goal-paths.ts contain?`

## Predictions, recorded before running

1. **A reaches** and banks a `shellResult` donor whose command contains the file path exactly once.
2. **B fires adaptation** — `[rebind] ... selected=true`, the first observed in this system. If B
   does *not* fire, then the mechanism cannot fire even under ideal conditions, and every
   explanation above about banking and thresholds is downstream of something more basic.
3. **C is refused**, most likely at `scaffold-too-weak`, because the shared token run is short. If C
   *does* fire, the retrieval key is less brittle than the 24h tally suggests.

B is the load-bearing prediction. It is deliberately the easy case: the point is to establish that
the mechanism has a working regime at all, because "0 of 462" is equally consistent with "never
applicable in practice" and with "broken outright", and those have different repairs.

**No threshold, gate, or policy is changed by this experiment.** It only dispatches goals.

---

## Result (05:01 UTC) — all three predictions confirmed

| goal | answer | ground truth | lexical rebind | pathway reuse |
|---|---|---|---|---|
| A (donor) | 381 | 381 ✓ | refused (no donor yet) | — |
| B (positive control) | 1346 | 1346 ✓ | **`selected=true` candidates=80** | `cover=1.00` |
| C (realistic) | 6212 | 6212 ✓ | refused, `scaffold-too-weak(0.13)×66`, `(0.14)×1` | `cover=1.00` |

**Prediction 2 held: adaptation fires.** At 04:58:48 —
`[rebind] result for "shellResult": selected=true candidates=80` — the first observed
`selected=true`. It adapted the donor's command by swapping the one varying slot:

```
donor:   wc -l /vessels/activity-api/src/routes/db-admin-repair.ts
adapted: wc -l /vessels/activity-api/src/routes/goal-paths.ts
```

and the answer was independently recomputed by a second derivation (`awk 'END{print NR}'`) before
being accepted. So the mechanism has a working regime, is correct when it fires, and "0 of 462" was
never "broken outright" — it was "almost never applicable."

**Prediction 3 held, and yields the sharpest number of the window.** The realistic rephrasing —
same task, same shape, new subject, different wording — scores **0.13–0.14 against a threshold of
0.15**. It misses by 0.01. The threshold was previously set to 0.15 from measurement, as "the first
value below the 0.18 these goals actually score"; natural rephrasing now measurably scores *below*
that. **This is evidence for a threshold change and I am not making one** — it is a policy
parameter, and the decision belongs in the gap store with the measurement attached, not in an
operator's unilateral edit during a measurement window.

**The two mechanisms are complementary, not redundant.** C reached *anyway*, via pathway reuse
(`cover=1.00`, borrowed from a different goal) — so the narrow lexical path failing did not cost
the reach. Any account of "adaptation" has to say which of the two it means.

## The instrument was lying, and this run caught it

Two lines from the same call, seconds apart:

```
[rebind] outcome selected=no candidates=0
[rebind] result for "shellResult": selected=true candidates=80
```

The first is emitted *before* the loop that assigns `best` and `candidates`, so it unconditionally
prints `selected=no candidates=0` on every call. That is the line a log-scraper reads as "adaptation
never fires" — a false negative baked into the instrument, in a system already misdiagnosed several
times by trusting a channel's own reporting. Dispatched for removal; the correct end-of-function
line already carries the information.
