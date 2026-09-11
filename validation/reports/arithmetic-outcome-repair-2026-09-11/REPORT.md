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

Milestone honesty: by the directive's strict consumption rule, the reuse leg is
only partially closed. The traversal repeated successfully and the α credit was
applied, but selection demonstrably did not consume it — all three walks
re-derived the identical attempt sequence. Repetition-with-credit, not learned
reuse; the filed inference gap is the blocker and the entry point to the
composition-ladder deliverable.

## Evidence

- Landed repair: goal-host-vessel `0c7f10e` (substrate-authored, route-edit-5d0bbb70)
- Pre-registered tests: goal-host-vessel `6586f01` (test/deterministic-compute.test.ts)
- Journal: goal-host-vessel unit, 15:37–15:46 UTC — verdict + credit lines quoted above
- Prior reproduction: validation/reports/autonomy-readiness-2026-09-11/evidence/arithmetic-result.json
