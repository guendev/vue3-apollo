import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((_nuxtApp) => {
    console.warn('Plugin injected by my-module!')
})
