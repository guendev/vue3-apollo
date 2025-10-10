import { defineNuxtModule, addPlugin, createResolver } from '@nuxt/kit'

interface ModuleClientOption {
  uri: string
}

// Module options TypeScript interface definition
export interface ModuleOptions {
  clients: Record<string, ModuleClientOption>
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'apollo',
    configKey: 'apollo',
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url)

    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addPlugin(resolver.resolve('./runtime/plugin'))
  },
})
