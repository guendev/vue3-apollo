import { InMemoryCache } from '@apollo/client'

/**
 * Advanced client setup via a runtime builder.
 *
 * Demonstrates a `typePolicies` field with a `read` **function** — which would be
 * lost if configured through serializable `nuxt.config` options, but survives here
 * because this is real runtime code. The link reuses the module's default chain so
 * auth, the `apollo:error` hook and the WS subscription split keep working.
 */
export default defineApolloClient(ctx => ({
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
}))
