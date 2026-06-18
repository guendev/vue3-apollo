import type { ComputedRef } from 'vue'

import { useOperationLoading } from './useOperationLoading'

/**
 * Track the loading state for Apollo queries in a specific component or scope
 *
 * @param id - Optional unique identifier. If not provided, uses current component instance uid
 * @returns A computed ref indicating whether any queries are currently loading for the given id
 *
 * @example
 * ```TypeScript
 * // In a component - automatically tracks this component's queries
 * const isLoading = useQueriesLoading()
 *
 * // Track queries with a custom id
 * const isLoading = useQueriesLoading('my-custom-id')
 * ```
 */
export function useQueriesLoading(id?: number | string): ComputedRef<boolean> {
    return useOperationLoading('queries', id)
}
