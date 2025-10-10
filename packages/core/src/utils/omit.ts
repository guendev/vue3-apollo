/**
 * Creates a new object by omitting specified keys from the source object.
 * Returns a type-safe object without the omitted keys.
 *
 * @template T - The type of the source object
 * @template K - The keys to omit from the object
 *
 * @param obj - The source object
 * @param keys - Array of keys to omit from the object
 *
 * @returns A new object without the specified keys
 *
 * @example
 * ```ts
 * const user = { id: 1, name: 'John', password: 'secret' }
 * const publicUser = omit(user, ['password'])
 * // { id: 1, name: 'John' }
 * ```
 *
 * @example
 * ```ts
 * const options = { debounce: 300, throttle: 500, prefetch: true }
 * const filtered = omit(options, ['debounce', 'throttle'])
 * // { prefetch: true }
 * ```
 */
export function omit<T extends Record<string, any>, K extends keyof T>(
    obj: T,
    keys: K[]
): Omit<T, K> {
    const result = { ...obj }

    for (const key of keys) {
        delete result[key]
    }

    return result as Omit<T, K>
}
