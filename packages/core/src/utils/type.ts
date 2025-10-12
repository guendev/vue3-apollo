import type { ApolloClient } from '@apollo/client/core'

/**
 * Context object passed to event hooks in useQuery, useMutation, and useSubscription.
 * Provides access to the Apollo Client instance that executed the operation.
 *
 * @example
 * ```ts
 * const { onDone } = useMutation(CREATE_USER_MUTATION)
 *
 * onDone((data, context) => {
 *   // Access the Apollo Client instance
 *   console.log('Client cache:', context.client.cache)
 *
 *   // Can be used to manually update cache or perform other operations
 *   context.client.writeQuery({
 *     query: GET_USERS_QUERY,
 *     data: { users: [...existingUsers, data.createUser] }
 *   })
 * })
 * ```
 */
export interface HookContext {
    /**
     * The Apollo Client instance that executed the GraphQL operation.
     * Can be used to access cache, perform additional queries, or update state.
     */
    client: ApolloClient
}

export interface UseBaseOption {
    /**
     * Apollo client identifier to use for this query.
     * Defaults to the default client if not specified.
     *
     * @example
     * ```ts
     * useQuery(ANALYTICS_QUERY, variables, {
     *   clientId: 'analytics'
     * })
     * ```
     */
    clientId?: string
}
