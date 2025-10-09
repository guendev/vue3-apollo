import vue from '@vitejs/plugin-vue'
import UnocssVitePlugin from 'unocss/vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        UnocssVitePlugin(),
        tsconfigPaths({
            loose: true
        })
    ]
})
