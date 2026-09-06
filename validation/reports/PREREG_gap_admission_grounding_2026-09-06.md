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

---

# Addendum: the grounded gap composed, and was refused by 5.79 milliseconds

## Retraction of this session's step-1 headline

I published, earlier today, that step 1 of the bootstrap closed — *"graded `exec_*` rows: 0 in the
system's recorded history → 2 in 19 minutes."* **That is false.** `feature_compose` has emitted
graded `exec_*` rows **continuously since 2026-08-29**: 988 rows, per day 62 / 103 / 137 / 92 / 30
/ 106 / 91 / 233 / 129. Hourly on 09-06: 13, 8, 3, 7, 9, 10, 12, 11, 11, 21, **16**, 8 — mean
10.8/h. My "2 in 19 minutes" is *below* the expected ~3.4, and the 10:00 hour I credited to my fix
was quieter than 09:00.

The false zero came from `id CONTAINS 'exec_'`, which does not match a SurrealDB record id — a trap
I had documented **in the same note**, as the reason my success-watcher was blind. I corrected the
instrument, re-ran the *after*, and never re-ran the *before*.

**The lesson, stated generally: fixing an instrument obliges re-measuring the baseline, not just
the new reading. A step change needs a rate on both sides; I had a rate on one.**

The four commits are real. Their true effect is a **linkage repair** — the consumer now keys its
satisfier trace to the real `exec_*` id instead of a synthesized `feature_compose:<sha>` string.
Real, modest, and not the opening of a channel.

## The compose outcome

| stage | result |
|---|---|
| grounding | `[fc-scope] region-named gap` — the `region` metadata was used |
| symbol resolution | `[fc-symbols] resolved 1/3 cross-file declaration(s): landedVessels` |
| apply | 1 op, `ok: true`, **line 6191** — exactly the anchored line |
| typecheck | `TC_EXIT=0` |
| shape-dispatch | `OK — 250 advertised shapes, 253 dispatch cases, all agree` |
| tests | 2188 pass, 25 fail, 5 flagged NEW |
| **verdict** | **UNFAVORABLE, rolled back** |

Four of the five "new" failures are in `resolveGapToFeature cooldown logic` — a file a one-line
edit to feature-compose's *trace emission* cannot reach. No concurrent compose touched
`gap-to-feature.ts` (the three in-window composes targeted `goal-host/index.ts`,
`activity-api/db-admin-repair.ts`, and `feature-compose.ts`), so this is not cross-contamination.

The timing-out test is:

```
(fail) vessel_mitosis_cutover > git-aware cutover: applies staged files, commits,
       mirrors to /vessels, emits cutoverApplied [20005.79ms]
  ^ this test timed out after 20000ms.
```

A git-heavy integration test, unrelated to the change, **over budget by 5.79 ms — 0.03%** — at
load average ~20.

## The class defect: a control that repeats under a constant confounder

The verify harness does difference against a baseline and re-runs to confirm:
`NEW test failures introduced by this draft, REPRODUCED on a second run`. That is a real control
against flakiness — but **both runs happen under the same sustained load**, so a load-induced
timeout reproduces perfectly and is promoted to "introduced by this draft."

Measured across **all 3,005 compose reports on disk**:

| verify run | UNFAVORABLE | FAVORABLE | FAVORABLE rate |
|---|---|---|---|
| no timeout | 1546 | 1005 | **39.4%** |
| contains a test timeout | 380 | 74 | **16.3%** |

Odds ratio **3.34**. 454 of 3,005 composes (15.1%) had a timeout in verify. If those would
otherwise have passed at 39.4%, the expected count is ~179 against 74 observed — **on the order of
100 approvals lost**, roughly 10% of the 1,079 FAVORABLE verdicts ever recorded.

This is correlational at corpus grain (a hanging draft could itself cause a timeout), but for the
instance measured here it is decisive: an unrelated git integration test, over by 5.79 ms.

**Why this is anti-compounding, not merely wasteful.** Every such refusal is also a β penalty. The
learner is taught that a correct fix was wrong, by the machine's load rather than by the code. And
because load is highest exactly when the lane is busiest, the noise is not random with respect to
the work — refusals concentrate when throughput is highest.

**Not hand-landed.** My standing rule is that no fix is judged at load average above ~10; this
verdict is INCONCLUSIVE, not wrong, and the gap remains open for the lane to retry when the box is
quiet. The system was not incapable here — it located the line, understood the symbol, and applied
the change cleanly. Its verifier was noisy.

---

# Addendum 2: fix 0 is a label, not a mechanism — and the harm chain is four-wide

Following the refusal into the charging site changes the fix from "build load-awareness" to
"reuse what is already there."

**The exemption already exists and is already honored.** `gap-to-feature.ts`:

```ts
export function isNonAttemptComposeResult(cb) {
  if (String(cb.failure_kind ?? "") === "environment") return true;
  ...
}
// line 3686:
if (!allOk && !pointer.dry_run && !isNonAttemptComposeResult(lastBody)) await bumpFailedAttempts(gap);
```

**And `failure_kind` is already computed** — `feature-compose.ts:6282`:

```ts
failure_kind: effectiveVerdict === "FAVORABLE" ? null
  : (classifyEnvironmentFailure(cutovers) ? "environment" : "fix"),
```

`classifyEnvironmentFailure` inspects **`cutovers` only**. A verify-stage environment failure is
therefore labeled `"fix"` and charged. The function's own comment records the identical defect one
stage earlier — a change-window lease deferral "was classified as a `fix` failure and charged to
the drafter, for an environment condition the drafter did not cause and cannot fix." Repaired for
cutovers; never extended to verify.

So fix 0 is one line, inserted after a unique anchor, using `verify` (declared at 5147, already
captured by the closure):

```ts
if (/timed out after \d+\s*ms/i.test(JSON.stringify(verify ?? []))) return "env_test_timeout";
```

## The harm chain is wider than a rank penalty

`bumpFailedAttempts` does four things in one call. A single 5.79 ms overrun therefore causes:

1. `failed_attempts++` → `landabilityScore` subtracts `min(fa * 0.1, 0.4)`. Two refusals = **−0.2**
   of rank, against a field topping out at 0.84–1.125. Measured live on
   `compose-grades-…`: grounding bought it +0.4; the refusals took back half.
2. `updateCalibration(category, false)` → a false negative into the category calibration.
3. A **bounded human-authorized exemption is spent** — one attempt closer to re-escalation, on a
   failure no human decision caused.
4. `joinDecisionOutcome(meta, { landed: false })` → a **causal decision-outcome record** asserting
   the decision led to no landing, when the cause was machine load.

Item 4 is the sharpest. The standing directive for this window is that the system must *causally
associate its actions on the environment with observable changes*. At this site it does exactly
that — and records the wrong cause.

## Accepted cost, stated in the gap rather than discovered later

A draft that introduces a genuine hang also times out, and after this change is labeled
environment and not charged. That signal loss is deliberate and bounded: `ok` stays false and
`rolled_back` stays true, so a hanging draft still **cannot land**. Only credit assignment moves,
never safety. One rare missed penalty against ~100 wrongly-charged correct fixes.

Filed as `a-load-induced-verify-timeout-is-charged-to-the-drafter-as-a-fix-failure`, grounded on
`feature-compose.ts`, region `classifyEnvironmentFailure`, single verbatim op.

---

# Addendum 3: the pass-regression un-latch is dead in practice

A second, independent instance of the fix-0 class, found while checking how hard the flake control
actually works. It works harder than I credited — observed shedding **22 of 22** spurious "new"
failures on a re-run, so the suite emits roughly that many per run under load and the control
correctly discards them.

But every observed `FLAKE CONFIRMATION` line ends the same
way: `(pass 2188 -> null)`, `(pass 1341 -> null)`, `(pass 2041 -> null)` — **the second run's pass
count never parses.** Not once.

Widened to seven days: **325 occurrences, 0 with a parseable second-run pass count.** Unanimous,
no exceptions.

Both runs issue the identical command (`timeout 240 bun test --timeout 20000 2>&1`) and the *first*
run parses fine, so this is not a parser bug. **I initially wrote that the re-run is killed at its
240 s cap; the 325/0 unanimity argues against that** — a load-dependent kill would let some
quiet-period run through. The cause is not established. Candidates: a shorter tool-level timeout on
the second `callTool` than on the first, or the summary never reaching the captured stream on that
path. What is established is the effect, and the effect is structural:

```ts
if (passRegressed && basePass !== undefined && curPass2 !== null && curPass2 >= basePass)
  passRegressed = false;
```

`curPass2` is null in every observed case, so **this un-latch can never fire**. And
`testOk = confirmedNewTest.length === 0 && !passRegressed` — so a draft that trips the pass
regression is rejected even when the re-run sheds *all* of its failures.

**134 of 3,008 compose reports (4.5%) were rejected carrying `PASSING TESTS DISAPPEARED`.** Some
fraction are genuine — a draft that breaks module load really does delete coverage — and the
un-latch exists precisely to rescue the rest. Since it never fires, **none are rescued**. I cannot
say how many of the 134 are false; I can say the mechanism that would tell them apart is dead.

**The generalization, now with two independent instances:** a control built to correct for noise is
disabled by the very conditions that produce the noise. Fix 0 is the flake re-run that reproduces
load-induced timeouts because both runs share the load. This is the pass-count un-latch that cannot
parse a re-run the load already killed.

**Not filed as a fourth gap**, deliberately and for the same reason as the `runner_up` finding: the
lane holds one slot, load is 23, and three grounded gaps are already queued and unserved. Adding a
competitor now costs more than it buys. It is next in line if fix 0 lands.

---

# Addendum 4: I was reading the wrong loadavg all session — and it makes fix 0 sharper

Every load figure in this report and in the session that produced it (`~16`, `~20`, `~29`) came
from the **host's** `uptime`. The substrate does not run on the host. It runs in a qemu VM
(Docker Desktop), and reads its own `/proc/loadavg`:

| layer | load | cores | ratio |
|---|---|---|---|
| host `uptime` | 28.42 | 16 | 1.78 |
| **substrate `/proc/loadavg`** | **16.88** | **14** | **1.21** |

The host figure is inflated by things the substrate has nothing to do with — Firefox, the Claude
processes, and a `wf-recorder` screen capture that has been running for **4 days at ~142% CPU**.

This is my own most-repeated error class, again: **verify at the layer that consumes the artifact.**
The consuming layer for a 20-second test budget is the VM's scheduler, not the host's. My standing
rule ("never judge a fix at loadavg > ~10") was written about the host and I applied it to the
substrate without re-deriving it.

**Nothing measured is invalidated.** The corpus result (74/454 vs 1005/2551, OR 3.34) is keyed on
the *presence of a timeout*, not on any load reading. The instance (20005.79 ms against a 20000 ms
budget) is a fact about the test run. What changes is the attribution, and it changes for the
better.

## The calibration band

`system-load.ts` already has a saturation guard:

```ts
export const SATURATION_MULTIPLE = 3;
return load > cpuCount * SATURATION_MULTIPLE;   // fires above 42 on this box
```

The observed timeout happened at **16.88**. So there is a band — roughly **1.2× to 3.0× cores** —
where the box is loaded enough to blow a 20-second test budget but *not* loaded enough for the
system to consider itself busy at all. Every false refusal measured here lives inside it.

That explains why an existing guard doesn't prevent this, and it argues specifically **against**
"raise the threshold" as the repair: the guard is answering a different question (should I start
heavy work?) from the one that matters here (can I trust a 20-second budget right now?). Labeling
the failure as `environment`, so the already-built exemption applies, remains the correct fix.

The gap record has been corrected in place — the wrong figure replaced in the evidence section, the
retraction and this band analysis appended, anchor and op verified intact afterward.

---

# Addendum 5: the fix for false charging was falsely charged, and its own failure improved it

Fix 0 was picked at ~12:32 and produced a compose report at 12:33. The drafter reproduced the op
**exactly** and applied it cleanly:

```
applied = [{'path': '…/feature-compose.ts', 'kind': 'edit', 'ok': True,
            'span': {'start_line': 6047, 'end_line': 6048}}]
verify  = [{'vessel': 'repos/development-vessel', 'errors': 'verify',
            'exit_code': None, 'ok': False, 'output': ''}]
```

**Empty output, null exit code — the verify did not run.** An environment failure of the purest
kind, classified `"fix"` because `classifyEnvironmentFailure` saw only `cutovers`, which were `[]`.
The gap now carries `failed_attempts: 2` against a single proposal on disk, so one non-merit
refusal was charged twice.

So: **the fix for environment-failures-charged-as-fix-failures was refused by an environment
failure charged as a fix failure**, and penalised 0.2 of rank for it. Third instance of the
self-protecting class this session, and the first observed acting on its own repair.

## The failure improved the fix

My original op matched a timeout string. It would **not** have caught this case — there is no
timeout text in an empty string. The correct predicate is *unverified*, not *timed out*, and this
file already draws that distinction one screen above, in the detail it builds for exactly this case:

> `TYPECHECK NOT ANSWERED (TC_EXIT=…) — the check did not complete, so this is UNVERIFIED, not
> proven broken. Failing closed is correct (an unverifiable edit must not land), **but do not read
> this as a defect in the draft**`

The code writes that sentence and then discards the distinction when computing `failure_kind`. The
op is now:

```ts
if (verify.some((vr) => !vr.ok && (vr.exit_code === null || !vr.output ||
    /timed out after \d+\s*ms/i.test(vr.output)))) return "env_verify_unanswered";
```

Three cases, one expression: the check never answered, the verify never ran, or a test timed out.
A genuinely refuted draft has neither a null exit code nor empty output — a real typecheck failure
carries TS error text, a real test failure carries failing test names — so this does not uncharge
drafts that were actually refuted. Failing closed is unchanged: `ok` stays false, `rolled_back`
stays true. **Only the charge moves.**

This is the loop working in the small: the system's own attempt exposed a case my predicate missed,
and the gap is better for it.

## Capacity is the dominant constraint, by the lane's own measurement

From a comment in `gap-to-feature.ts`, measured over 48 h: **4,482 picks, 3,699 of them (82.5%)
ending `verdict=BUSY stage=capacity`.** Fewer than one pick in five ever reaches a composer. That
reframes the whole session's "why hasn't it composed" question — and it is a resource decision, not
a defect, which is why I have filed nothing about it.

## Fair-window test, in flight

Container load has fallen to **5.66** — the first window this session inside my own rule for judging
a fix. I re-dispatched fix 0 as a targeted `pointer.gap_id` compose. This is deliberately **not** a
bypass of any gate: the system drafts, applies, typechecks, tests and gates its own change; the only
thing being bypassed is the admission ranking that its own false charge had demoted. If it lands
here, the earlier refusals were environmental, as claimed. If it fails on the merits at load 5.66,
my diagnosis was wrong and the record should say so.
