# The arithmetic outcome failure, repaired through the substrate — 2026-09-11

One integration milestone, executed end to end through the cockpit: the reproduced
arithmetic false rejection (readiness review dispatch e5a1849a: correct shellResult
stdout `20413` for "Compute 137 * 149" judged "an incorrect value instead",
answerBody absent) was repaired by a substrate-authored commit, proven against
correct, buried, and wrong cases, and the repaired traversal was reused and
credited on related tasks.

## Root cause

`verifyDeterministicCompute` (repos/goal-host-vessel/src/index.ts) recomputes the
truth independently but was rejection-only by design: on truth-present it returned
null and handed final judgment to the LLM reach judge, which re-derived the
arithmetic wrongly and rejected the correct answer. An information-availability
failure (law 8): the verifier computed the load-bearing fact and discarded it.
Because `answerBody` is only rendered on `reached === true`, the same defect also
produced the delivery failure.

## The repair (dispatched, not hand-edited)

Contract revision, designed to green attempt 3 of the reproduced walk and NOT
attempt 2 (the advisor-caught trap: green-on-truth-present-anywhere would credit
the web-search-blob pathway, teaching Thompson the wrong lesson and relaxing the
verification the goal directive forbids relaxing):

- wrong distinctive answer → reject (unchanged);
- recomputed truth delivered STANDALONE (exact trimmed shellResult stdout, or a
  bare digest line) AND no artifact-write clause in the goal →
  `deterministic:verified-compute-answer`, reached:true, deterministic:true;
- truth buried in prose/blobs, or write/save/store/record/append/titled goals →
  null, LLM judge still owns delivery.

Sequence:

1. **Pre-registered the behaviour, not the string**: rewrote
   `test/deterministic-compute.test.ts` first; 3 new green cases failed against
   the old code, every null-preserving and rejection case passed (15/3 split).
2. **Dispatched via run_goal_async** with verbatim anchors. First dispatch
   (561fe0d4) refused `BUSY` — directed compose cap 2, both slots autonomous.
   Second (7b2a6eff → gap route-edit-5d0bbb70) drafted, passed the semantic gate
   (`addresses:true`, reachable_symbols includes verifyDeterministicCompute),
   verdict FAVORABLE citing typecheck + bun test, and **landed
   `0c7f10e` on origin/dev with no operator hands on the source**.
3. **Verified at the consuming layer**: landed diff read and matches the goal;
   `/vessels/goal-host-vessel/src/index.ts` carries the change; unit restarted
   15:35:07 (after the 15:31 cutover); all 18 pre-registered tests pass against
   the pulled commit; the new verdict string then appeared in the live journal.

## Live proof across the case matrix

| Dispatch | Goal | reached | answerBody | Verdict path |
|---|---|---|---|---|
| 0143ee8c | Compute 137 * 149 (the original repro) | yes | `20413` | deterministic:verified-compute-answer, α +2 → satisfier:shellResult |
| 601160f3 | Compute 254 * 397 | yes | `100838` | same traversal reused, α +2 → satisfier:shellResult |
| 2ea5cfeb | What is 37% of 48200 | yes | `17834` | wrong intermediate REJECTED live by wrong-compute-answer; buried web truth NOT greened; final green via the floor gate — its 5-char final text "17834" satisfies the new bare-line deterministic green in the same verifyGoalReached path, but the floor does not journal the verdict reason, so deterministic-vs-LLM attribution there is code-path inference, not a logged line; no α applied (the floor has no lastPick) |

The 0143ee8c walk exercised all three contract legs in one trace: the LLM's wrong
answer was rejected, the web-search blob containing the truth was not greened
("only related content"), and the standalone shell stdout earned the deterministic
green. Rejection did not weaken — the 2ea5cfeb walk's mid-flight
`deterministic:wrong-compute-answer` is the live negative control.

All three verdicts were consumed downstream (the strict integration rule):
`learning.alphaBetaDelta` non-empty on the two multiplications, answerBody
delivered on all three, and three operator ground-truth labels written to the
oracle corpus (etv68r4ok0..., aev7ij4zm6..., huuq35ati3...).

## What the reuse evidence exposed (filed, not absorbed)

Every post-repair walk still inferred `llm_completion_dispatch` first and burned
1–2 rejected attempts before the credited shell pathway: learning credits the
traversal but goal-target inference does not read the credit, so first-mile reuse
never shortens the walk. Filed as gap
`arithmetic-inference-ignores-earned-shell-pathway` (read back by id after write).
Residual doc drift: the drafter appended the revised contract line but left the
old "it NEVER greens" sentence in the header comment one line above.

Residual verification-relaxation vector, recorded not fixed: the artifact-write
guard vocabulary (`write|save|store|record|append|titled`) misses
`send|post|publish|deliver|dispatch|email` — "Compute 123 times 456 and send it
to the relay" would green on a standalone 56088 with the send unverified. Small
surface, but it is exactly the class the goal directive forbids; the next compose
cycle on this file should extend the verb list and its test.

## The reuse leg, closed the same day

The "selection does not consume the credit" premise was **wrong**, and the filed
gap was corrected before the autonomous composer could act on it (a
false-premise gap is retried forever). The journal shows selection consults the
goal-path store on every walk; acceptance is gated by the *shaped*
`pathwayReusePolicy` (minSuccessful=3, minTotal=5), and the arithmetic pathway
simply had not earned that yet ("pathway reuse: 3 recommended, 0 accepted").
The re-derivation was the designed disposition for an under-evidenced pathway,
not a severed junction.

Confirmed by intervention, not code change:

- Repeated dispatches accumulated `goal_execution_paths` counters for the goal
  (hash 471aac56733f5f64) to 4/5 on `[universal-tool-fallback]` and
  `[satisfier:shellResult]`.
- The next dispatch (c605d88f, 16:22:06 UTC) logged
  `pathway reuse: accepted 1-step pathway via goal_hash (4/5 reached)` →
  `REUSE-BEFORE-DERIVE — running it directly and skipping the walk` →
  `REUSE LINEAGE (transmitted) … reached=true`, and delivered `20413` in ~4 s
  versus ~60–90 s of fresh derivation — zero llm/web detours.
- Fresh operands (f20cb489, 613×287): tier-2 rebind adapted the cached verified
  command to the new inputs (`bun -e 'console.log(613 * 287)'`, selected from 68
  candidates), one-step chain, deterministic green, α +2 — first-mile
  adaptation per the CLAUDE.md middle expectation. Partial on delivery: the
  walk-path answer renderer wraps the correct value in markdown (the known
  formatting defect; the floor path delivers bare integers).
- Along the way the system self-filed `lost-reached-verdict-walk-satisfier-1-…`
  when a reach-patch matched no row — self-detection firing without operator
  involvement.

Closure verification (both checked, not assumed):

- **The composer race was won.** gap-compose picked the false-premise gap up
  within 1 s of the write (16:03:14), but no fc-plan, semantic-gate, or landed
  commit ever named it — the queued compose was dropped in the dev-vessel's
  lossy restarts before drafting anything. Nothing from the false premise
  touched selection code.
- **The close persisted as `status: closed`, but `resolution` and `close_basis`
  were silently discarded by the write path** — a live instance of the known
  "close_basis survives on 0.5% of closures" class. The closure evidence
  survives only in the gap's summary text. Two oracle labels record the reuse
  and adaptation verdicts (fzxw5qc3p2..., f6u8iylf2e...).

Scope honesty for the ladder deliverable: what is demonstrated here is a 1-step
pathway on trivial goals plus command-level adaptation. The composition ladder
proper (useful multistep task, ribosome extraction, boundary adaptation,
composition-with-composition) remains open — the directive itself warns that
high reach on trivial goals is a gamed metric. The natural next unit is the
self-repair cycle: the walk self-filed `lost-reached-verdict-…` when a
reach-patch matched no row (it deduplicated into an existing instance of the
same class from three days earlier — a recurring class), which is a
substrate-detected failure with a substrate-generated gap: deliverable 5's
entry, to be watched and coaxed rather than hand-completed.

## Second arc: the multistep ladder rung, two more substrate-landed repairs

Goal: `Compute 419 * 733 and record the result in a memory note titled
"product-419-733"` — a useful two-step composition (shell compute →
memoryNote_write) whose artifact the verifier can independently resolve.

**Defect 1 — rebind adapted only one operand.** The tier-2 rebind adapted the
learned 137×149 command to `console.log(419 * 149)`: the absent-slot check
compared the *punctuated* goal token `"149."` against a command containing
`149)`, concluded the command didn't encode that dimension, and skipped the
slot. Verification contained it at every layer (walk hollow, floor
`wrong-compute-answer`, cache eviction + tombstone — the failure demonstrably
changed downstream selection state), but the walk re-derived the same wrong
adaptation from the donor on every retry, so the goal could never reach.
Filed with root cause; substrate landed the fix (`cd011e3`: strip punctuation
per token before the containment check). Post-fix the walk fresh-synthesized
the correct command and wrote the correct note.

**Defect 2 — the judge false-rejected the correct multistep execution.** With
everything correct (stdout 307127, note body 307127), the LLM judge re-derived
419×733 as "307787" and rejected; a retry confabulated "failed to write" on a
successful write. This is the original disease resurfacing exactly where the
standalone-green guard hands off. Substrate landed a compute-artifact oracle
(`d8b1d92`): recompute in-process, resolve the titled note via
`verifyNamedArtifactCarries`, green on exact carry / red on mismatch / fail-open
when unresolvable. Recovery verified live: dispatch bee01ffa reached via
`deterministic:verified-compute-artifact` with α +2 to the memoryNote_write
pathway.

**Defect 3 — reach erased the requested artifact.** Reading the receiver after
the green: 3 s post-reach, the answer-delivery pipeline overwrote the note body
with the rendered markdown answerBody — the clean `307127` the goal asked to
record survives only buried in the embedded digest. Filed as
`post-reach-answer-mirror-clobbers-the-goal-named-artifact` (deliverable 1's
"reaching a shape must not erase what the user asked for", observed live).
Dispatch labeled `partial` in the oracle corpus.

This arc is one full detect→diagnose→repair-through-substrate→activate→
independently-verify cycle repeated twice back-to-back on related defects —
though both diagnoses were operator-authored, which is the distance remaining
to deliverable 5's system-generated repair goals.

## Evidence

- Landed repair: goal-host-vessel `0c7f10e` (substrate-authored, route-edit-5d0bbb70)
- Pre-registered tests: goal-host-vessel `6586f01` (test/deterministic-compute.test.ts)
- Journal: goal-host-vessel unit, 15:37–15:46 UTC — verdict + credit lines quoted above
- Prior reproduction: validation/reports/autonomy-readiness-2026-09-11/evidence/arithmetic-result.json
