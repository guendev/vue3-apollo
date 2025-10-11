import type { ComputedRef } from 'vue'

import { computed } from 'vue'

import { useApolloLoading } from './useApolloLoading'

/**
 * Track global loading state for all Apollo subscriptions across the entire application
 *
 * @returns A computed ref indicating whether any subscriptions are currently loading globally
 *
 * @example
 * ```TypeScript
 * // In-app layout - show connection status
 * const isGlobalSubscriptionLoading = useGlobalSubscriptionLoading()
 *
 * // Use in template
 * <div v-if="isGlobalSubscriptionLoading" class="connecting-indicator">
 *   Establishing real-time connection...
 * </div>
 * ```
 */
export function useGlobalSubscriptionLoading(): ComputedRef<boolean> {
    const { activeGlobal } = useApolloLoading()

    return computed(() => (activeGlobal.value.subscription || 0) > 0)
}
