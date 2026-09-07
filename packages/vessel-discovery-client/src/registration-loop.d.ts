/**
 * DiscoveryRegistrationLoop — register on startup, 60s heartbeat, deregister on stop.
 *
 * Canonical registration/heartbeat semantics, ported from
 * `ias-executor-ts/src/hosts/discovery-registration-loop.ts` (SC-P4 client
 * unification). Behavior contract:
 *
 *   - register on start(), then heartbeat every 60s (configurable)
 *   - a heartbeat 404 means discovery lost the record (e.g. discovery-vessel
 *     restarted and dropped its in-memory registry) → re-register IMMEDIATELY
 *   - after 3 consecutive heartbeat failures, fire the onUnhealthy callback
 *   - graceful DELETE deregistration on stop()
 *   - advertised-endpoint env contract: VESSEL_ADVERTISE_ENDPOINT /
 *     SUBSTRATE_ADVERTISE_HOST (+ SUBSTRATE_ADVERTISE_PORT_OFFSET, default
 *     10000) for `endpoint`, VESSEL_PUBLIC_ENDPOINT for the optional
 *     `public_endpoint` (host/LAN-reachable URL for callers outside the
 *     container network)
 *
 * Usage:
 *   const loop = new DiscoveryRegistrationLoop({ discoveryEndpoint, vesselId, ... });
 *   await loop.start();
 *   // ...
 *   await loop.stop();
 */
import type { Logger } from "./types.js";
export interface DiscoveryRegistrationLoopConfig {
    discoveryEndpoint: string;
    vesselId: string;
    vesselName: string;
    /** Advertised shapes — forwarded as-is to /register */
    shapes: string[];
    /** Full URL of this vessel's /resolve endpoint, e.g. http://localhost:8230/resolve */
    resolveEndpoint: string;
    /** API key for discovery-vessel auth (Authorization: ApiKey <key>) */
    apiKey: string;
    /** Port this vessel listens on — included in registration metadata */
    port: number;
    /** Heartbeat interval in ms. Default 60_000. */
    heartbeatIntervalMs?: number;
    /**
     * Mark this vessel as a system-level vessel (not tenant-scoped).
     * Required for substrate services so they appear in all org-scoped discovery
     * queries. Vessels without orgId AND without systemVessel=true are invisible.
     */
    systemVessel?: boolean;
    /** Logger instance (default: console-backed, debug suppressed) */
    logger?: Logger;
}
export declare class DiscoveryRegistrationLoop {
    private readonly config;
    private heartbeatTimer?;
    private failureCount;
    private unhealthyCallback?;
    private readonly logger;
    constructor(config: DiscoveryRegistrationLoopConfig);
    /**
     * Register with discovery-vessel and start the heartbeat timer.
     * Non-blocking: a registration failure is logged but does not throw.
     */
    start(): Promise<void>;
    /**
     * Send a DELETE to discovery-vessel and clear the heartbeat timer.
     * Called on SIGTERM / graceful shutdown.
     */
    stop(): Promise<void>;
    /**
     * Register a callback that fires when three consecutive heartbeats fail.
     * The daemon can use this to mark itself unhealthy / restart.
     */
    onUnhealthy(callback: () => void): void;
    private registrationPayload;
    private headers;
    private register;
    private heartbeat;
    private deregister;
}
//# sourceMappingURL=registration-loop.d.ts.map