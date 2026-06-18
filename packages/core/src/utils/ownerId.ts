/**
 * Owner-id namespacing for the Apollo tracking store.
 *
 * Custom loading keys and component instance uids share the same
 * `number | string` space, so a custom `loadingKey: 5` could previously collide
 * with the component whose `uid` is `5` and merge their unrelated loading state.
 * Prefixing each source keeps the two buckets distinct while staying consistent
 * between the writer (`useApolloTracking`) and the readers
 * (`useQueriesLoading` / `useMutationsLoading` / `useSubscriptionsLoading`).
 */

/**
 * Bucket id for an explicit/custom loading key (`loadingKey`, or the `id`
 * passed to the loading helpers).
 */
export function customOwnerId(id: number | string): string {
    return `key:${id}`
}

/**
 * Bucket id derived from a component instance uid.
 */
export function instanceOwnerId(uid: number): string {
    return `uid:${uid}`
}
