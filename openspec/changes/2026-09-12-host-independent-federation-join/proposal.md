# Host-independent join — a substrate of any vessel inventory joins the common discovery+identity network with one anchor, and stays routable when punchthrough is unavailable

**Date:** 2026-09-12
**Vessels:** discovery-vessel (`src/index.ts` `/bootstrap`, registration replication), `scripts/substrate/federation-relay/federation-transport-server.ts` (startup gate, relay re-acquisition), `scripts/substrate/gen-env.sh` (anchor precedence, hub peer wiring)
**Stage:** SPEC — grounded in a live probe of `substrate-live` on 2026-09-12, plus a code trace of the join path
**Predecessor:** `openspec/changes/2026-07-19-relay-findability-replication/proposal.md`. Its operator-ratified decision — *"the relay won't always be available due to networking conditions, so internally a direct connection should be equivalent to a punchthrough"* — is the governing decision here. **Three of its four approach items never landed.** This change implements them and adds the two defects the live probe surfaced.

## The objective, restated as invariants

1. **Inventory independence.** A substrate container running *any* subset of vessels joins one common discovery + identity network. Nothing about which units are enabled changes how it joins.
2. **Host independence.** No joining path may depend on a host IP, a host workspace, or a hand-carried address. The single anchor is a discovery endpoint; everything else is read from it at use time (law 1), and the anchor itself must be expressible without knowing the host it lands on.
3. **Routability without punchthrough.** Reachability degrades in this order and never below the last rung: direct dial → DCUtR hole-punch → permanently-relayed circuit. A NAT that blocks punchthrough must cost latency, not reachability.

## Live probe (2026-09-12, `substrate-live`, up 2 days, healthy)

Every number below is from the running system, not from a document.

### Defect A — a dead host IP, pinned in a host workspace file, has removed this substrate's libp2p node entirely

```
$ docker exec substrate-live systemctl is-active federation-transport-vessel
activating                                  # Restart=always: never `failed`, restart counter 23

$ docker exec substrate-live journalctl -u federation-transport-vessel -n 25
[fed-transport] bootstrap fetch failed: The operation timed out.
[fed-transport] ERROR: set RELAY_MULTIADDR or point BOOTSTRAP_URL/HUB_DISCOVERY_URL at a discovery serving /bootstrap
```

The cause is an address, and it is exactly the thing invariant 2 forbids:

```
$ docker exec substrate-live grep -E '^HUB_DISCOVERY_URL=' /etc/substrate/env /workspace/.substrate-secrets
/etc/substrate/env:HUB_DISCOVERY_URL=""
/workspace/.substrate-secrets:HUB_DISCOVERY_URL=http://138.197.116.56:18100

$ curl -s --max-time 6 -o /dev/null -w '%{http_code}' http://138.197.116.56:18100/bootstrap
000                                          # unreachable, 6s timeout
```

The unit loads `/etc/substrate/env` first and `-/workspace/.substrate-secrets` second, so the **host workspace file wins** over the substrate's own env — a hardcoded droplet IP from a hub that no longer answers. `BOOTSTRAP_URL` resolves to that dead IP (`federation-transport-server.ts:47`, `HUB_DISCOVERY_URL` preferred over local `DISCOVERY`), the fetch times out, and the process exits 1. Meanwhile the **local** `/bootstrap` answers in 0.7ms from inside the same container:

```
$ docker exec substrate-live curl -s -o /dev/null -w '%{http_code} %{time_total}' http://127.0.0.1:8100/bootstrap
200 0.000667
```

Consequence: a stale host address in a host-workspace file silently deleted the whole overlay for this substrate, and the only symptom is a unit parked in `activating`. This is a direct violation of law 11 (location independence) and reproduces the operator-memory class *"a restart loop reports `activating`, never `failed`."*

### Defect B — the direct-dial path exists but is unreachable, because startup hard-gates on a relay anchor

```ts
// federation-transport-server.ts:61
if (!RELAY) { console.error('[fed-transport] ERROR: set RELAY_MULTIADDR or point …'); process.exit(1) }
```

The transport already *announces* direct listen addresses alongside the circuit — the 2026-07-19 decision partially landed (`:326` "registration rows must announce the node's DIRECT listen…", `:524` and `:647` "circuit first, then direct listen addrs — direct ≡ punchthrough"). But none of that code can ever run on a substrate without a relay, because the process exits before constructing the node.

This makes the bootstrap **circular**. Discovery derives `relay_multiaddrs` from *registered circuit multiaddrs* when `RELAY_MULTIADDR` is unset (`discovery/src/index.ts:164-170`); circuits exist only once a transport reserves; the transport refuses to start without an anchor. A standalone substrate — the default inventory — therefore can never originate an overlay:

```
$ curl -s http://localhost:18100/bootstrap
{"relay_multiaddrs":[],"identity_endpoint":"http://127.0.0.1:8101","discovery_endpoint":"","prefer_transport":"libp2p"}
```

Invariant 3 says the relay is the *last* rung, not the entry condition. A relay-less transport is a fully useful peer on a LAN or a single host: it dials directly, it is dialed directly, and it acquires a circuit later if one appears.

### Defect C — `/bootstrap`, the one public join door, serves host-dependent anchors (2026-07-19 item 3, still open)

The response above is what a remote joiner receives. `identity_endpoint` is `http://127.0.0.1:8101` — on the joiner's machine that names the joiner's *own* loopback — and `discovery_endpoint` is empty. Verified that this is not a Host-header artifact:

```
$ curl -s -H 'Host: hub.example.net:18100' http://localhost:18100/bootstrap
{"relay_multiaddrs":[],"identity_endpoint":"http://127.0.0.1:8101","discovery_endpoint":"",…}
```

The handler (`index.ts:171-180`) derives both anchors from `PUBLIC_IP` / `IDENTITY_PUBLIC_URL` / `DISCOVERY_PUBLIC_URL`, falling back to `IDENTITY_VESSEL_URL` (loopback) and `""`. So the door is only honest on a node that was hand-fed its own public address — which is the host-dependence invariant 2 exists to eliminate. A joiner cannot tell a correctly-configured hub from an under-configured one: both return HTTP 200.

### Defect D — no vessel on this substrate is dialable at all

The one-directional federation in `docs/FEDERATION.md` was diagnosed as a hub-side quirk. It is not: it is what every substrate looks like once its transport is down. The live registry:

```
$ …/resolve -d '{"pointer":{"type":"vesselRegistry"}}'     # 13 vessels
development-vessel-local  http://localhost:8090    libp2p_multiaddr: null
relevance-sink-vessel     http://127.0.0.1:8255    libp2p_multiaddr: null
goal-host-vessel          http://127.0.0.1:8210    libp2p_multiaddr: null
…                         (13 of 13, no exceptions)
```

Every row is loopback with no multiaddr, so discovery's peer dialability filter (`index.ts:267-274`) would drop **all thirteen** from any peer's fan-out. That filter is correct — it is reporting the truth. The transport is the only libp2p node on a substrate and every other vessel reaches the overlay through it, so Defect B does not merely disable federation for this node: it makes the node invisible to every peer, by a mechanism no health check reports.

`docs/FEDERATION.md` carries a measured warning: all nine spoke vessels mirrored into the hub, while the spoke resolving `llmCompletion` / `activityTemplate` from the hub returned `found:false`. The filter is `discovery/src/index.ts:267-274` — a peer row survives only with a non-empty `libp2p_multiaddr` **or** a non-loopback endpoint — and hub vessels register as `http://127.0.0.1:<port>` with neither. The documented cure (`SUBSTRATE_ADVERTISE_HOST`) is a host IP, so it satisfies the filter by violating invariant 2.

### Defect E — registration does not replicate (2026-07-19 item 1, still open)

```
$ grep -n 'replicat\|forwardRegister\|propagat' repos/discovery-vessel/src/*.ts
(no matches)
```

Findability remains hub-star: spoke→hub by query-time fan-out, hub→spoke by the 120s push mirror, spoke-A→spoke-B only through a common hub. A hub's own `PEER_DISCOVERY_ENDPOINTS` is still explicit-only (`gen-env.sh:986`), so a hub has no resolve-time fan-out at all.

## Approach

Ordered so each step is independently verifiable and the earlier ones unblock the later ones.

1. **Ungate the transport startup (Defect B).** Remove the `process.exit(1)` on a missing relay. Construct the libp2p node with direct listeners, register with the direct addrs it already knows how to announce, and re-attempt relay reservation on a backoff — adopting a circuit whenever one becomes discoverable and refreshing the hub mirror **on acquisition**, not only on the 120s tick (this is 2026-07-19 item 2, "loud reservation", which the same edit delivers). A relay-less transport is a healthy transport; the relay is an upgrade.

2. **Make the join anchor request-derived (Defect C).** `/bootstrap` must answer with anchors derived, in precedence order, from (a) explicit `*_PUBLIC_URL` env, (b) **the request's own origin** — the scheme/host/port the client demonstrably just reached us on, which is by construction routable *from that client*, (c) the registered rows for identity/discovery. Never loopback, never empty: when no honest anchor can be produced, say so in the body rather than returning a 200 that reads as success. Request-derived is the host-independent default `PUBLIC_IP` was standing in for.

   This **supersedes** item 3 of the 2026-07-19 proposal (derive from registered rows, or return a `not-a-join-door` marker); keep the refusal half, replace the derivation half. Two implementation constraints the implementing goal must honour: the response is a function of the request, so it must not be cached across clients (`Vary: Host` at minimum), and behind a TLS-terminating proxy the derivation must read `X-Forwarded-Proto` / `X-Forwarded-Host` rather than the raw connection origin. The Host header is client-controlled, which is harmless here — a client that lies about the host it reached us on only misdirects itself — but it is the reason the value can never be shared between clients.

3. **Anchor precedence must not let a host file outrank the substrate (Defect A).** `/workspace/.substrate-secrets` must not silently override `/etc/substrate/env` for routing anchors, and a `HUB_DISCOVERY_URL` that fails its `/bootstrap` probe must degrade to local discovery rather than killing the process — step 1 makes that degradation survivable. A pinned hub address becomes a *hint*, checked at use time, never a precondition.

4. **Symmetric dialability (Defect D).** Hub vessels acquire circuit multiaddrs the same way spoke vessels do — through the hub's own transport ingress — so the dialability filter passes on reachability the peer actually has, not on an advertised host IP. The constraints to honour are in the transport's own comments: the self-mirror guard (`:558`), no ping-pong on mutual mirrors, prefer-direct-over-mirror ordering (`:197-199`), and the silent-disappearing-mirror failure at `:319`. Read all three blocks before choosing between relaxing the self-mirror guard and registering an ingress row per local vessel.

5. **Registration replication (Defect E).** `POST /register` propagates to `PEER_DISCOVERY_ENDPOINTS` — bounded fan-out, deduped by `libp2p_peer_id`, TTL'd, idempotent last-writer-wins upsert — so dialing in *is* being findable, rather than being pullable by whoever happens to point back. Give a hub a non-empty default `PEER_DISCOVERY_ENDPOINTS` so hub-side fan-out exists.

## Verification

Each numbered step has a check that fails today.

| Step | Check | Today |
|---|---|---|
| 1 | `systemctl is-active federation-transport-vessel` on a substrate with no relay | `activating`, restart counter climbing |
| 1 | `/bootstrap` `relay_multiaddrs` non-empty after the transport reserves, with no `RELAY_MULTIADDR` in env | `[]` |
| 2 | `curl -H 'Host: <foreign>' <disc>/bootstrap` returns anchors reachable from the caller | loopback identity, empty discovery |
| 3 | Unreachable `HUB_DISCOVERY_URL` ⇒ transport runs locally, emits a gap | process exits 1, 23 restarts |
| 4 | Spoke resolves a hub-owned `llmCompletion` | `found:false` (doc-measured) |
| 5 | Vessel dialing spoke-A's discovery is resolvable from sibling spoke-B without a hub round-trip | not implemented |

The end-to-end harness already exists: `repos/libp2p-federation-transport/federation-hub-e2e.ts`, plus the pre-flight `curl <hub>/bootstrap | jq '.relay_multiaddrs | length'` > 0. Add the missing direction — spoke resolving a hub-owned shape — as the closing assertion.

## Non-goals

Consensus across registries (last-writer-wins upsert with TTL suffices for findability). New inventory machinery: profiles, role selection, and transport auto-enable already cover "arbitrary vessel inventories" — the `apply-inventory` ungoverned-units caveat is a separate, known issue. The objective's word is *routability*, and routability is steps 1–4.
