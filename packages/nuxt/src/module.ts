import { addImports, addPlugin, addTemplate, addTypeTemplate, createResolver, defineNuxtModule, resolvePath, updateRuntimeConfig } from '@nuxt/kit'
import { existsSync } from 'node:fs'

import type { ApolloModuleOptions } from './type'

export default defineNuxtModule<ApolloModuleOptions>({
    defaults: {
        autoImports: true
    },
    meta: {
        compatibility: {
            nuxt: '^4.0.0'
        },
        configKey: 'apollo',
        name: '@vue3-apollo/nuxt'
    },
    async setup(options, nuxt) {
        const resolver = createResolver(import.meta.url)

        if (!options.clients || Object.keys(options.clients).length === 0) {
            console.warn('[@vue3-apollo/nuxt] No Apollo clients configured.')
            return
        }

        // Resolve each client's optional `configFile` (a runtime builder) to an
        // absolute path. These are imported by a generated module at build time so
        // non-serializable config (links, cache, typePolicies functions) survives.
        const clientConfigPaths: Record<string, string> = {}
        for (const [clientId, clientConfig] of Object.entries(options.clients)) {
            if (clientConfig.configFile) {
                const resolved = await resolvePath(clientConfig.configFile)
                if (!existsSync(resolved)) {
                    throw new Error(
                        `[@vue3-apollo/nuxt] configFile for client "${clientId}" not found: `
                        + `"${clientConfig.configFile}" (resolved to "${resolved}").`
                    )
                }
                clientConfigPaths[clientId] = resolved
            }
        }

        // Runtime config must stay JSON-serializable: drop the `configFile` paths
        // (the plugin imports the resolved builders from the generated template).
        const runtimeClients = Object.fromEntries(
            Object.entries(options.clients).map(([clientId, clientConfig]) => {
                const { configFile: _configFile, ...rest } = clientConfig
                return [clientId, rest]
            })
        )

        updateRuntimeConfig({
            public: {
                apollo: {
                    ...options,
                    clients: runtimeClients
                }
            }
        })

        // Generate a module mapping clientId -> builder. Always emitted (possibly
        // empty) so the plugin's `#build/apollo/client-configs` import resolves.
        addTemplate({
            filename: 'apollo/client-configs.mjs',
            getContents: () => {
                const ids = Object.keys(clientConfigPaths)
                const imports = ids
                    .map((id, index) => `import client_${index} from ${JSON.stringify(clientConfigPaths[id])}`)
                    .join('\n')
                const entries = ids
                    .map((id, index) => `  ${JSON.stringify(id)}: client_${index}`)
                    .join(',\n')
                return `${imports}\nexport const clientConfigs = {\n${entries}\n}\n`
            },
            write: true
        })

        // Type declaration for the generated module so the runtime plugin's
        // `#build/apollo/client-configs` import resolves under `nuxi typecheck`.
        addTypeTemplate({
            filename: 'types/apollo-client-configs.d.ts',
            getContents: () => [
                'declare module \'#build/apollo/client-configs\' {',
                '  export const clientConfigs: Record<string, any>',
                '}'
            ].join('\n')
        })

        // Make the builder helper available inside `configFile` files (only when the
        // builder feature is actually used). It can also be imported explicitly from
        // `@vue3-apollo/nuxt/config`.
        if (Object.keys(clientConfigPaths).length > 0) {
            addImports({
                from: resolver.resolve('./runtime/defineApolloClient'),
                name: 'defineApolloClient'
            })
        }

        addPlugin(resolver.resolve('./runtime/plugin'))

        if (options.autoImports) {
            nuxt.hook('imports:sources', (sources) => {
                sources.push({
                    from: '@vue3-apollo/core',
                    imports: [
                        // composables
                        'useApolloClients',
                        'useApolloClient',
                        'useFragment',
                        'useLazyQuery',
                        'useMutation',
                        'useQuery',
                        'useSubscription',

                        // helpers
                        'useApolloTrackingStore',
                        'useApolloTracker',
                        'useApolloTracking',
                        'useMutationsLoading',
                        'useQueriesLoading',
                        'useSubscriptionsLoading'
                    ]
                })
                sources.push({
                    from: resolver.resolve('./runtime/composables/useAsyncQuery'),
                    imports: [
                        'useAsyncQuery'
                    ]
                })
            })
        }

        // Add TypeScript declarations
        nuxt.hook('prepare:types', ({ references }) => {
            references.push({ types: '@vue3-apollo/nuxt' })
        })
    }
})
