// generated-by: numen-sync
import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";
import type { UsageCredential, UsageProvider, UsageReport, UsageUnit } from "@oh-my-pi/pi-ai/usage";
import registerKiroProvider from "pi-provider-kiro";

type HostProviderConfig = Parameters<ExtensionAPI["registerProvider"]>[1];
type HostProviderModels = NonNullable<HostProviderConfig["models"]>;

interface KiroProviderUsageBucket {
	id: string;
	label: string;
	usedDisplay: string;
	used?: number;
	limit?: number;
	unit?: string;
	overageChargesDisplay?: string;
	resetAt?: string;
}

interface KiroProviderUsage {
	subscriptionTitle?: string;
	resetAt?: string;
	overageStatus?: string;
	usageBuckets?: KiroProviderUsageBucket[];
}

interface KiroOAuthCredentials {
	access: string;
	refresh: string;
	expires: number;
	region?: string;
	profileArn?: string;
}

export function buildKiroUsageCredential(
	credential: UsageCredential,
	cliCredential?: KiroCatalogCredential,
): KiroOAuthCredentials | null {
	const access = credential.accessToken || credential.apiKey;
	if (!access) return null;
	return {
		access,
		refresh: credential.refreshToken ?? "",
		expires: credential.expiresAt ?? 0,
		...(cliCredential?.access === access ? { region: cliCredential.region, profileArn: cliCredential.profileArn } : {}),
	};
}

export function mapKiroUsage(provider: string, usage: KiroProviderUsage, fetchedAt: number): UsageReport | null {
	if (!usage.usageBuckets?.length) return null;
	const limits = usage.usageBuckets.map(bucket => {
		const resetAt = bucket.resetAt ?? usage.resetAt;
		const parsedReset = resetAt ? Date.parse(resetAt) : NaN;
		const unit = bucket.unit?.toLowerCase();
		const normalizedUnit: UsageUnit =
			unit === "credits" || unit === "requests" || unit === "tokens" || unit === "usd" ? unit : "unknown";
		const usedFraction = bucket.used !== undefined && bucket.limit !== undefined && bucket.limit > 0
			? bucket.used / bucket.limit
			: undefined;
		return {
			id: bucket.id,
			label: bucket.label,
			scope: { provider, ...(usage.subscriptionTitle ? { tier: usage.subscriptionTitle } : {}), windowId: "monthly" },
			amount: {
				...(bucket.used !== undefined ? { used: bucket.used } : {}),
				...(bucket.limit !== undefined ? { limit: bucket.limit } : {}),
				unit: normalizedUnit,
			},
			window: {
				id: "monthly",
				label: "Monthly",
				durationMs: 30 * 86_400_000,
				...(Number.isFinite(parsedReset) ? { resetsAt: parsedReset } : {}),
			},
			...(usedFraction !== undefined && Number.isFinite(usedFraction) && usedFraction >= 1
				? { status: "exhausted" as const }
				: {}),
			...(bucket.overageChargesDisplay ? { notes: [bucket.overageChargesDisplay] } : {}),
		};
	});
	return {
		provider,
		fetchedAt,
		limits,
		...(usage.subscriptionTitle ? { metadata: { planType: usage.subscriptionTitle } } : {}),
		...(usage.overageStatus ? { notes: [usage.overageStatus] } : {}),
	};
}
interface KiroCatalogCredential {
	access: string;
	region: string;
	profileArn?: string;
}

interface UpstreamRefreshContext {
	allowNetwork: boolean;
	force: boolean;
	credential?: { type: "api_key"; key: string } | KiroCatalogCredential;
	signal?: AbortSignal;
}

interface UpstreamProviderConfig extends HostProviderConfig {
	refreshModels?: (context: UpstreamRefreshContext) => Promise<HostProviderModels>;
	oauth?: NonNullable<HostProviderConfig["oauth"]> & {
		getCliCredentials?: () => KiroCatalogCredential | undefined;
		fetchUsage?: (credentials: KiroOAuthCredentials) => Promise<KiroProviderUsage>;
	};
}

function bridgeKiroUsage(name: string, config: UpstreamProviderConfig): UsageProvider | undefined {
	const fetchUsage = config.oauth?.fetchUsage;
	if (config.usage || !fetchUsage) return undefined;
	return {
		id: name,
		validatesCredentials: true,
		fetchUsage: async params => {
			if (!(params.credential.accessToken || params.credential.apiKey)) return null;
			const credential = buildKiroUsageCredential(params.credential, config.oauth?.getCliCredentials?.());
			if (!credential) return null;
			return mapKiroUsage(name, await fetchUsage(credential), Date.now());
		},
	};
}

// Upstream Pi hooks refreshModels and oauth.fetchUsage live under different OMP provider hooks.
function adaptExtensionApi(pi: ExtensionAPI): ExtensionAPI {
	return new Proxy(pi, {
		get(target, property, receiver) {
			if (property !== "registerProvider") return Reflect.get(target, property, receiver);

			return (name: string, config: UpstreamProviderConfig): void => {
				const { refreshModels, ...hostConfig } = config;
				const usage = bridgeKiroUsage(name, config);
				target.registerProvider(name, {
					...hostConfig,
					...(usage ? { usage } : {}),
					...(refreshModels ? {
						fetchDynamicModels: apiKey => {
							const cliCredential = config.oauth?.getCliCredentials?.();
							const credential =
								apiKey && cliCredential?.access === apiKey
									? cliCredential
									: apiKey
										? ({ type: "api_key", key: apiKey } as const)
										: undefined;
							return refreshModels({
								allowNetwork: true,
								force: true,
								...(credential ? { credential } : {}),
							});
						},
					} : {}),
				});
			};
		},
	});
}

export default function numenKiro(pi: ExtensionAPI): void {
	const providerFactory: unknown = registerKiroProvider;
	if (typeof providerFactory !== "function") throw new Error("pi-provider-kiro did not export an extension factory");
	providerFactory(adaptExtensionApi(pi));
}
