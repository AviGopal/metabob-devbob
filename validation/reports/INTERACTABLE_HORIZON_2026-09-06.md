# The interactable horizon: what it means, and what the system can currently do at it

Measured 2026-09-06 against the live substrate. Every number below was read from
the running system, not from a cache.

## What "the interactable horizon" means

The substrate's gap machinery is **file-shaped end to end**. A gap names a file,
the walk hydrates that file, a resolver reads it, a drafter proposes a diff, and
typecheck verifies. That pipeline works — it is the loop that produced this
session's autonomous dispatches.

Interface gaps are not file-shaped. Their evidence is a **rendered frame** and a
**stream of interaction signals** — what a human saw, did not understand, clicked
away from. The file, if there is one, is downstream of the finding, not the
finding itself.

The **interactable horizon** is the boundary between those two regimes: the outer
edge of what the system can perceive and act on through its surfaces. Learning to
learn gaps at that horizon means acquiring the ability to *form* a gap whose
evidence is a frame plus a signal stream — and, before that, to stop coercing
every gap into a file path.

## Evidence that the horizon is exactly where the machinery stops

**1. The walk invents a file path when a gap has none.** The substrate
autonomously dispatched a closer on a gap filed this session. Goal-host logged:

```
gap-hydration: injected record ui-screenshot-routed-to-hollow-proxy (cited file: none)
walk rawResolve code_quality: resolver rejected — ENOENT: no such file or directory,
  open 'substrate/gap/ui-screenshot-routed-to-hollow-proxy'
```

The gap identifier was coerced into a filesystem path. The generator fired
correctly; the walk had nowhere to put a fileless gap.

**2. It is a class, not one gap.** Over six hours of goal-host logs: 27 gap
hydrations (21 with a cited file, 6 without) and 21 rawResolve rejections
clustering on the same defect —

| count | resolver | rejection |
|---|---|---|
| 5 | `source_code` | `filePath is required` |
| 4 | `problem_detection` | `filePaths is required` |
| 5 | `problem_detection` | `no analyzable file: ENOENT … 'problems/…'` |
| 2 | `source_code` | `ENOENT … '/workspace/git/super-repo/gap…'` |
| 2 | `code_quality` | `ENOENT … 'substrate/gap/ui-screenshot-r…'` |

Two independent resolvers invent a path from a gap id. The rejections are
concentrated in "required file missing" and "path synthesized," which is the
signature of a fileless goal entering a file-shaped lane.

**3. The signals exist; nothing reads them — and most are not human.**
`WORKSPACE_ROOT/interactor-log/` holds **384 durable records** — 235
`uiFeedback_write`, 56 `interactorDismiss_write`, 39 `interactorAssertion_write`,
30 `interactorEvent_write`, 24 `interactorAttachment_write`. The gap store
contains **zero gaps in any `ui` category** (all categories enumerated).

> **CORRECTION.** An earlier revision of this report called all 384 "human
> interaction signals." That was wrong. Read per record: only **~33 carry
> `source: stateful-ui-vessel`** and the human complaint grammar. The other
> **~351 have no source** and carry execution-pool fields (`dispatch_id`,
> `executionId`, `goal`, `filePath`, `fileContent`, `extract_*`) — substrate
> impulses written to interactor shapes, including a full
> `orphaned_capability_scan` payload stored as `uiFeedback_write`. The complaint
> shape is a dumping ground for the substrate's own traffic.
>
> The error came from `grep -o "\"kind\":..." | sort | uniq -c`, which counts
> **occurrences, not records**: it reported 140 kind-values across a file where
> only 5 records have a `kind` field at all. **Name the denominator; count
> records, not matches.**

So the channel is broken twice over: **contaminated** (≈91% substrate noise) and
**unread** (no consumer). And of the ~33 genuine human records, **26 are
dismissals** — the lowest-information human act. The system has almost no
evidence about what a human wants from its surface, because the only instrument
that would measure it is broken in both directions.

The passthrough resolver's own header admits it
(`repos/development-vessel/src/resolvers/interactor-passthrough.ts`): the
substrate-side gap-consumer closes the loop *"when it learns to read the log
files."* It has not.

**4. The surface says so itself.** Captured headlessly from the live board
(`human-surface-vessel`, `:18310`), the panel titled **KNOWN WRONG WITH THIS
INTERFACE** reads `0 open · 0 closed` and states:

> No legibility findings on record. The detector has either not run against this
> surface or found nothing — those are different, and this view cannot tell them
> apart.

That is the surface independently reporting the same gap filed from the cockpit
this session (`ui-legibility-scan-resolver-only-never-walked`: zero activities,
zero executions), and doing so while correctly refusing to conflate null with
zero.

**5. Mechanism, read from source.** `repos/human-surface-vessel/src/store.ts`
header: *"No persistence — a restart clears every store."* `/api/state` serves
`recentFeedback(20)` from that volatile store; `GET :18310/api/state` returns
empty arrays for feedback, observations, events, asserts, and attachments. The
surface's self-knowledge is wiped every restart while the durable log accumulates
unread. Filed as `surface-self-knowledge-panel-reads-a-volatile-store`.

## What the surfaces are

Five, not one — the audit loop and the interaction vocabulary must be shared
across them:

| Surface | What it is |
|---|---|
| metabob cockpit | the agent surface; its footage is the trace store |
| `human-surface-vessel` `:18310` | the web board a human resolver talks to |
| `stateful-ui-vessel` `:18270` | the durable panel pool behind it (188 panels) |
| obsidian-vessel instances | one per vault+human, presence-conditioned |
| peer substrates | federated surfaces (`dashboard-test-substrate-1` also live) |

Capture works on both regimes: headless Chrome with `--virtual-time-budget` for
the board (an activity can do this unattended), and the in-plugin Electron
`obsidian:ui_screenshot` resolver for Obsidian (verified this session, real
1269×769 frame).

## The loop, run once, on the surface itself

The gap `surface-self-knowledge-panel-reads-a-volatile-store` was filed with a
cited file and dispatched. What happened is the demonstration, and it is more
interesting than a clean landing:

1. **Edit-intent routed correctly.** Goal-host detected the named file pre-walk
   and routed to `feature_compose` — the file-shaped lane worked, because this
   gap had been given a file.
2. **The drafter wrote code into a comment.** The goal quoted the header comment
   (*"No persistence — a restart clears every store."*) as its verbatim anchor,
   and the drafter placed `hydrateFeedback()` inside that comment block.
3. **The gate caught it.** Adversarial refuters agreed **2/2 at confidence 1.00**:
   the function "is called immediately after its definition within the header
   comment block (lines 30-31)." The compose was refused; the gap stayed open.

That refusal is the system working. A comment-embedded function is inert code —
it typechecks vacuously, and a diff-reading gate can pass it. This is the exact
class that has historically landed inert. Here it was caught before landing.

**The operator error worth recording:** the goal-design rule is a *short, unique,
verbatim* anchor — but the anchor must be **executable code, not a comment**.
Quoting a comment aims the drafter at a region where nothing it writes can run.

4. **Redispatched with a code anchor** (`export function recentFeedback(...)`),
   explicitly requiring module-scope invocation and placement outside any comment
   block. The compose started and resolved 68 anchor candidates for `store.ts`,
   then produced no plan within ~15 minutes.

5. **It landed** — `f555bed4 feat(human-surface-vessel): close the feedback loop
   through the box`, roughly 40 minutes after dispatch, with no operator hands.
   The code is exactly what the goal specified: `hydrateFeedbackFromLog()`
   defined **outside any comment**, invoked at **module scope**, `readFileSync`
   on `${WORKSPACE_ROOT}/interactor-log/uiFeedback_write.jsonl`, wrapped in
   try/catch. The comment-anchor lesson held on the retry.

   (An earlier revision of this section called this attempt "unjudged" because
   the host was at load 12.7 with LLM timeouts. It was slow, not failed.)

**And the specification was wrong.** The change is correct against the goal I
wrote; the goal was written *before* I discovered the log is ~91% substrate
spillover. It pushes every record unconditionally, so on restart the human
complaint panel fills with `orphaned_capability_scan` payloads — **worse than the
empty state it replaces**. It also pushes raw log lines
(`{id, shape, visibility, received_at, pointer}`) directly as `Feedback` entries
without mapping or validation, and ignores `MAX_HISTORY`.

Not yet active: the unit has not restarted since **2026-08-28**, and module-scope
code runs only at import. Filed as
`feedback-hydration-will-flood-the-panel-with-substrate-spillover`, with the
repair (filter on `pointer.source` and `pointer.kind`, map onto `Feedback`, cap at
`MAX_HISTORY`) and a standing instruction not to restart the vessel until it is
fixed.

**The honest verdict on the demonstration:** the loop works end to end — filed,
picked up, routed, drafted, refused when inert, retried, landed. What it cannot
do is notice that the operator asked for the wrong thing. **Every gate reads the
diff against the goal; none reads the goal against reality.** That is the same
defect as the missing effect gate, one level up.

## The surface improving — measured, with a before and after

The board's **KNOWN WRONG WITH THIS INTERFACE** panel reads `/api/gaps`, which
resolves `substrateGap` filtered to `category: ui_legibility`.

**Before:** `0 open · 0 closed`, and the body text *"No legibility findings on
record. The detector has either not run against this surface or found nothing —
those are different, and this view cannot tell them apart."*

**After:** `3 open · 0 closed`, rendering three accurate, attributed findings
about the surface itself, each with its provenance line
(`operator:claude-fable-cockpit`). The panel that exists to show a human what is
wrong with the interface now does so.

Two further results came out of doing this:

**The detector ran for the first time.** `ui_legibility_scan` against
`obsidianEndpoint http://host.docker.internal:18310` returned `available: true`,
`panel_open: true`, `rules_checked: 3`, `violations: []` — the board passes all
three computable rules. But **a clean scan emits nothing, so nothing records that
it ran**: the exact ambiguity the panel names about itself cannot be resolved by
running the detector. Filed as `a-clean-legibility-scan-leaves-no-trace`.
(Instrument note: the pointer key is `obsidianEndpoint`; passing `endpoint`
returns "obsidian-vessel unreachable or ui_view empty" — a wrong-key error that
reads as a dead surface.)

**Working on an interface gap hides it from the interface.** A natural control
appeared: two gaps filed minutes apart, both `category: ui_legibility`, both
citing `repos/human-surface-vessel/src/store.ts`. The one the substrate did *not*
compose on is still `ui_legibility` and renders in the panel. The one it *did*
compose on — the hydration defect — is now stored as `edit_intent_route` and is
therefore **invisible on the surface it is about**. Consistent with
`substrateGap_write` replacing rather than merging: the compose lane rewrites the
record and its own category wins. The more attention the substrate pays an
interface defect, the less a human can see that it is known. Filed as
`working-on-an-interface-gap-hides-it-from-the-interface`.

That last one is the horizon in miniature. To get a gap *closed* it must cite a
file and enter the file-shaped lane; entering that lane strips the category that
makes it *visible* to the human it concerns. Closure and visibility are in direct
conflict, and nothing in the system notices.

## What improvement looks like

Three gaps, all filed, all verified in the live store:

1. `ui-screenshot-routed-to-hollow-proxy` (class; two named instances) —
   discovery routes to producers that cannot serve the shape.
2. `ui-legibility-scan-resolver-only-never-walked` — the audit behavior is a
   resolver, never an activity; invisible to the learning loop.
3. `surface-self-knowledge-panel-reads-a-volatile-store` — the surface cannot
   show the human what it already knows is wrong with it.

The fourth, which this report exists to name: **the gap machinery cannot hold a
fileless gap.** Until it can, every interface finding must be laundered through a
file citation by an operator — which is precisely the pattern law 13 calls a gap
in the system rather than a workflow to institutionalize.

## Audit: what the surface displays, and why

Every element on the board, its data source, and whether it earns its place. The
test applied to each: **name its reader and the decision it changes.**

| Element | Source | Verdict |
|---|---|---|
| Ask box + Send | free text → `dispatch_goal` | **Earns it.** The one place a human acts as more than a spectator. |
| Eight chips | derived from the advertised shape vocabulary | **Earns it.** "Derived from the 393 shapes the fleet is advertising right now" is exact — the registry returns 393. Clicking fills, does not send, as stated. |
| Chip legend (dashed / faded / accented) | static caption | **Partly.** "The accented chip changes this page itself" is true and visible. Dashed and faded describe states not currently present, so two thirds of the legend explains nothing on screen. |
| Runs list (≤50) | `activeDispatches` from goal-host | **Fails, see below.** Exactly 50 rows returned, so the stated cap is honest. |
| Status pill | `reached`, not `status` | **Earns it, and is the best thing on the board.** One row is `completed` + `reached:false` and correctly displays as *not reached* — the hollow-completion case caught in the render. |
| Rightmost column | `operator` when present, else `trigger` | **Fails.** Two different questions in one column position. |
| Runs footer | static caption | **Earns it.** "A verdict here is what the walk recorded — open a run to see what it actually produced" is exactly the right caveat. |
| Detail pane | selected run | **Promise unfulfillable on a third of rows.** |
| Known-wrong panel | `/api/gaps`, `category: ui_legibility` | **Earns it**, and now has content. |

### The dominant defect: a third of the board cannot be read

Measured against the feed it renders (n=50):

- `goal` is null on **17** → rendered as *"goal text not recorded on this dispatch"*
- `executionId` is null on **17**
- **both** null on **16 — just under a third of the board**
- `answerBody` null on **47**
- `reached`: 45 false, 4 true, 1 null

So on sixteen rows a reader can neither see what was asked nor open the row to
find out, because the detail pane needs an `executionId`. Those rows carry a red
pill, an elapsed time, and a lane tag. They **inform no decision while reading
unmistakably as failure** — the surface's dominant visual impression is produced
by its least informative content. And with `answerBody` null on 94% of rows,
there is almost nothing for the presentation layer to render either.

This is a data-capture defect surfacing as a UI defect. No layout change fixes
it; re-rendering a null produces a prettier null. Filed as
`a-third-of-the-board-is-rows-a-human-cannot-read`.

### The attribution defect

`operator` is null on **35 of 50**; `trigger` is always present. The board shows
`claude-code-operator` on some rows and `gap-closing` or `run-goal` on others *in
the same column*, silently falling back. Those answer different questions — who
asked, versus what lane fired — and that distinction is precisely what separates
an operator's own work from the substrate's autonomous work. `trigger` even has a
literal value `operator`, which is a lane name and not a person. Filed as
`the-runs-column-conflates-who-asked-with-how-it-fired`.

### What the audit says overall

The board's **captions are honest and its verdict logic is right** — it shows
`reached` over `status`, it warns that a verdict is only what the walk recorded,
and it refuses to conflate null with zero. Almost every defect found is upstream
of the pixels: missing goal text, missing execution ids, missing answers, a
conflated field. The surface is a faithful instrument pointed at a sparse signal,
and it cannot be made good without improving what it is pointed at.
