import type { Theme } from 'vitepress'

import DefaultTheme from 'vitepress/theme'
// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'

import './style.css'
import 'virtual:group-icons.css'

export default {
    extends: DefaultTheme,
    Layout: () => {
        return h(DefaultTheme.Layout)
    }
} satisfies Theme
