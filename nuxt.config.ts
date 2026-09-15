import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-09-01',
  modules: [
    '@nuxtjs/i18n',
    '@nuxtjs/color-mode',
    '@pinia/nuxt',
    '@nuxt/eslint',
    '@nuxt/test-utils/module',
  ],
  css: ['~/assets/css/main.css', '@fortawesome/fontawesome-svg-core/styles.css'],
  // Els components es registren pel nom del fitxer (CustomButton, HeroSection), no per la carpeta.
  components: [{ path: '~/components', pathPrefix: false }],
  vite: { plugins: [tailwindcss()] },
  // Server-only. Set NUXT_GIPHY_API_KEY in .env (local) or as a Worker secret (prod). Regla 01.
  runtimeConfig: { giphyApiKey: '' },
  nitro: { preset: 'cloudflare_module' },
  colorMode: { preference: 'system', fallback: 'light', classSuffix: '' },
  i18n: {
    baseUrl: 'https://danimorales.dev',
    locales: [
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
      { code: 'ca', language: 'ca-ES', name: 'Català', file: 'ca.json' },
      { code: 'es', language: 'es-ES', name: 'Español', file: 'es.json' },
    ],
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: { useCookie: true, cookieKey: 'i18n_redirected', redirectOn: 'root' },
  },
  eslint: { config: { stylistic: false } },
  app: {
    head: {
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
      meta: [{ name: 'theme-color', content: '#ffffff' }],
    },
  },
})
