import type { NormalizedCacheObject } from '@apollo/client/core'

import type { ApolloRuntimeConfig } from '../type'

declare module '@nuxt/schema' {
    interface NuxtPayload {
        apollo?: Record<string, NormalizedCacheObject>
    }

    interface PublicRuntimeConfig {
        apollo?: ApolloRuntimeConfig
    }
}

declare module 'nuxt/schema' {
    interface NuxtPayload {
        apollo?: Record<string, NormalizedCacheObject>
    }

    interface PublicRuntimeConfig {
        apollo?: ApolloRuntimeConfig
    }
}

// Để tránh lỗi isolated modules
export {}
