// generated-by: numen-sync
import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";
import registerKiroProvider from "pi-provider-kiro";

type HostProviderConfig = Parameters<ExtensionAPI["registerProvider"]>[1];
type HostProviderModels = NonNullable<HostProviderConfig["models"]>;

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
	};
}

// Upstream Pi calls this hook refreshModels; OMP calls it fetchDynamicModels.
function adaptExtensionApi(pi: ExtensionAPI): ExtensionAPI {
	return new Proxy(pi, {
		get(target, property, receiver) {
			if (property !== "registerProvider") return Reflect.get(target, property, receiver);

			return (name: string, config: UpstreamProviderConfig): void => {
				const { refreshModels, ...hostConfig } = config;
				if (!refreshModels) {
					target.registerProvider(name, hostConfig);
					return;
				}
				target.registerProvider(name, {
					...hostConfig,
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
