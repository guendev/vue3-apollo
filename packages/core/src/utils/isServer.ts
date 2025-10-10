/**
 * Check if the code is running on the server (SSR context).
 * Works with any Vue SSR framework (Nuxt, Vite SSR, etc.)
 *
 * @returns true if running on server, false if running on client
 *
 * @example
 * ```ts
 * import { isServer } from './utils/isServer'
 *
 * if (isServer()) {
 *   // Server-only logic
 * } else {
 *   // Client-only logic
 * }
 * ```
 */
export function isServer(): boolean {
    return typeof window === 'undefined'
}
