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
