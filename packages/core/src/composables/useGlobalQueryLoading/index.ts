import type { ComputedRef } from 'vue'

import { computed } from 'vue'

import { useApolloLoading } from '../useApolloLoading'

/**
 * Track the global loading state for all Apollo queries across the entire application
 *
 * @returns A computed ref indicating whether any queries are currently loading globally
 *
 * @example
 * ```TypeScript
 * // In-app layout - show global loading indicator
 * const isGlobalQueryLoading = useGlobalQueryLoading()
 *
 * // Use in template
 * <div v-if="isGlobalQueryLoading" class="global-loading-bar" />
 * ```
 */
export function useGlobalQueryLoading(): ComputedRef<boolean> {
    const { activeGlobal } = useApolloLoading()

    return computed(() => (activeGlobal.value.query || 0) > 0)
}
