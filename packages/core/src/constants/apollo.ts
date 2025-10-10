import type { ApolloClient } from '@apollo/client/core'
import type { InjectionKey } from 'vue'

/**
 * Injection key for Apollo clients registry
 */
export const APOLLO_CLIENTS_KEY: InjectionKey<Record<string, ApolloClient>> = Symbol('apolloClients')
