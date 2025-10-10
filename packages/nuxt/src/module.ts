import { addPlugin, createResolver, defineNuxtModule } from '@nuxt/kit'

// Module options TypeScript interface definition
export interface ModuleOptions {
    clients: Record<string, ModuleClientOption>
}

interface ModuleClientOption {
    uri: string
}

export default defineNuxtModule<ModuleOptions>({
    // Default configuration options of the Nuxt module
    defaults: {},
    meta: {
        configKey: 'apollo',
        name: 'apollo'
    },
    setup(_options, _nuxt) {
        const resolver = createResolver(import.meta.url)

        // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
        addPlugin(resolver.resolve('./runtime/plugin'))
    }
})
