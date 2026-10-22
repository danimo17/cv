import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    include: ['tests/**/*.spec.ts'],
    setupFiles: ['tests/setup/clean-git-env.ts'],
    environmentOptions: { nuxt: { domEnvironment: 'happy-dom' } },
  },
})
