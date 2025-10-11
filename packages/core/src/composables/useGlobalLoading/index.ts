import type { ComputedRef } from 'vue'

import { computed } from 'vue'

import { useApolloLoading } from '../useApolloLoading'

/**
 * Track the global loading state for all Apollo operations (queries, mutations, subscriptions) across the entire application
 *
 * @returns A computed ref indicating whether any Apollo operation is currently loading globally
 *
 * @example
 * ```TypeScript
 * // In-app layout - show global loading overlay
 * const isGlobalLoading = useGlobalLoading()
 *
 * // Use in template
 * <div v-if="isGlobalLoading" class="global-overlay">
 *   <LoadingSpinner />
 * </div>
 * ```
 */
export function useGlobalLoading(): ComputedRef<boolean> {
    const { activeGlobal } = useApolloLoading()

    return computed(() => (activeGlobal.value.all || 0) > 0)
}
