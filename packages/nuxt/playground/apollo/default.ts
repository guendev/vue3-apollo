import { InMemoryCache } from '@apollo/client'

/**
 * Advanced client setup via a runtime builder.
 *
 * Demonstrates:
 * - a `typePolicies` field with a `read` **function** — lost if configured through
 *   serializable `nuxt.config` options, but it survives here because this is real code;
 * - using an app-level composable (`useRequestURL`) inside the builder — the module
 *   restores the Nuxt context, so this works even after internal awaits.
 *
 * The link reuses the module's default chain so auth, the `apollo:error` hook and the
 * WS subscription split keep working.
 */
export default defineApolloClient((ctx) => {
    // App-level composables are available here.
    const url = useRequestURL()
    if (import.meta.server) {
        console.warn(`[apollo:${ctx.clientId}] building client for`, url.pathname)
    }

    return {
        cache: new InMemoryCache({
            typePolicies: {
                Post: {
                    fields: {
                        // Computed field proving a typePolicy function survives SSR + CSR.
                        titleUpper: {
                            read(_, { readField }) {
                                const title = readField<string>('title')
                                return typeof title === 'string' ? title.toUpperCase() : undefined
                            }
                        }
                    }
                }
            }
        }),
        link: ctx.defaultLink
    }
})
