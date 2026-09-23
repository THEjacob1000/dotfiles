// generated-by: numen-sync
/**
 * Operator configuration for the quota router. This file is the whole config
 * surface: edit it, run `numen sync`, restart OMP. `NUMEN_QUOTA_ROUTER=off` in
 * the environment disables routing for one process without a sync.
 */
import type { RoutingReservePolicy } from "./policy";

export interface RouterConfig {
	enabled: boolean;
	/**
	 * Optional quota-balanced pools for roles that intentionally permit peers
	 * to trade places. Ordered retry chains do not belong here: roles absent
	 * from this map keep their configured native model while usable, then walk
	 * `retry.fallbackChains` in order.
	 */
	pools: Record<string, string[]>;
	/** Remaining fraction of an allowance at or below which a candidate stops taking new work. */
	reservePct: number;
	/**
	 * What to do when every candidate is inside its reserve: `auto` spends the
	 * best one anyway, `fail-closed` refuses the spawn, `confirm` refuses with a
	 * message naming the choices (a headless spawn cannot prompt).
	 */
	reservePolicy: RoutingReservePolicy;
	/** Discount applied to a candidate's headroom per preference rank (0..1); 0 ignores operator order, 1 makes it decisive. */
	preferenceWeight: number;
	/** Relative headroom difference under which two candidates count as tied and the less recently used one wins. */
	tieTolerance: number;
}

export const config: RouterConfig = {
	enabled: true,
	pools: {},
	reservePct: 10,
	reservePolicy: "auto",
	preferenceWeight: 0.15,
	tieTolerance: 0.1,
};

export function routingEnabled(): boolean {
	const override = process.env.NUMEN_QUOTA_ROUTER?.trim().toLowerCase();
	if (override === "off" || override === "0" || override === "false") return false;
	if (override === "on" || override === "1" || override === "true") return true;
	return config.enabled;
}
