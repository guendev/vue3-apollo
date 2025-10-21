/**
 * Creates a new object by picking specified keys from the source object.
 * Returns a type-safe object with only the picked keys.
 *
 * @template T - The type of the source object
 * @template K - The keys to pick from the object
 *
 * @param obj - The source object
 * @param keys - Array of keys to pick from the object
 *
 * @returns A new object with only the specified keys
 *
 * @example
 * ```ts
 * const user = { id: 1, name: 'John', email: 'john@example.com', password: 'secret' }
 * const publicUser = pick(user, ['id', 'name'])
 * // { id: 1, name: 'John' }
 * ```
 *
 * @example
 * ```ts
 * const options = { debounce: 300, throttle: 500, prefetch: true, cache: false }
 * const selected = pick(options, ['prefetch', 'cache'])
 * // { prefetch: true, cache: false }
 * ```
 */
export function pick<T extends Record<string, any>, K extends keyof T>(
    obj: T,
    keys: K[]
): Pick<T, K> {
    const result = {} as Pick<T, K>

    for (const key of keys) {
        if (key in obj) {
            result[key] = obj[key]
        }
    }

    return result
}
