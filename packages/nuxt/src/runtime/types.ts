import type { ApolloRuntimeConfig } from '../type'

declare module '@nuxt/schema' {
    interface PublicRuntimeConfig {
        apollo?: ApolloRuntimeConfig
    }
}

declare module 'nuxt/schema' {
    interface PublicRuntimeConfig {
        apollo?: ApolloRuntimeConfig
    }
}

// Để tránh lỗi isolated modules
export {}
