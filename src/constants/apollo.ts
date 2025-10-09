import type { ApolloClient } from '@apollo/client/core'
import type { InjectionKey } from 'vue'

/**
 * Default Apollo client identifier
 */
export const DEFAULT_APOLLO_CLIENT = 'default'

/**
 * Injection key for Apollo clients registry
 */
export const APOLLO_CLIENTS_KEY: InjectionKey<Record<string, ApolloClient>> = Symbol('apolloClients')
