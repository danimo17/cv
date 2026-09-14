import type { StackGroup } from '~/domain/cv/types'

export const stack: StackGroup[] = [
  {
    id: 'frontend',
    icon: 'code',
    items: [
      'Vue 3',
      'Nuxt',
      'Pinia',
      'TypeScript',
      'JavaScript',
      'Tailwind CSS',
      'CSS / SCSS',
      'PrimeVue',
      'Cypress',
      'Vitest',
    ],
  },
  {
    id: 'ecommerce',
    icon: 'cart-shopping',
    items: ['Shopify Plus', 'Liquid', 'Shopify Functions', 'Checkout & Pixels', 'GraphQL'],
  },
  {
    id: 'ai',
    icon: 'wand-magic-sparkles',
    items: [
      'Claude Code',
      'Agentic pipelines',
      'Spec-driven development',
      'Quality gates',
      'Automated testing',
    ],
  },
  {
    id: 'backend',
    icon: 'server',
    items: ['Laravel', 'PHP', 'MySQL', 'REST', 'Git', 'Cloudflare Workers'],
  },
  {
    id: 'design',
    icon: 'pen-ruler',
    items: ['Figma', 'Photoshop', 'Illustrator', 'After Effects', 'Balsamiq', 'Zeplin'],
  },
]
