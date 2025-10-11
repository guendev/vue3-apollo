import type { ComputedRef } from 'vue'

import { computed } from 'vue'

import { useApolloLoading } from '../useApolloLoading'

/**
 * Track global loading state for all Apollo mutations across the entire application
 *
 * @returns A computed ref indicating whether any mutations are currently loading globally
 *
 * @example
 * ```TypeScript
 * // In-app layout - disable actions during mutations
 * const isGlobalMutationLoading = useGlobalMutationLoading()
 *
 * // Use in template
 * <button :disabled="isGlobalMutationLoading">Save All</button>
 * ```
 */
export function useGlobalMutationLoading(): ComputedRef<boolean> {
    const { activeGlobal } = useApolloLoading()

    return computed(() => (activeGlobal.value.mutation || 0) > 0)
}
