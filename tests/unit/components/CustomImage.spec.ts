import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import CustomImage from '~/components/shared/CustomImage.vue'

describe('CustomImage', () => {
  it('renders src/alt with no srcset/sizes by default', async () => {
    const wrapper = await mountSuspended(CustomImage, {
      props: { src: '/img/daniel.jpg', alt: 'Daniel' },
    })
    expect(wrapper.attributes('src')).toBe('/img/daniel.jpg')
    expect(wrapper.attributes('alt')).toBe('Daniel')
    expect(wrapper.attributes('srcset')).toBeUndefined()
    expect(wrapper.attributes('sizes')).toBeUndefined()
  })

  it('reflects srcset/sizes when passed (decisió 037)', async () => {
    const wrapper = await mountSuspended(CustomImage, {
      props: {
        src: '/img/daniel.jpg',
        alt: 'Daniel',
        srcset: '/img/daniel-400.jpg 400w, /img/daniel-800.jpg 800w',
        sizes: '(min-width: 768px) 400px, 100vw',
      },
    })
    expect(wrapper.attributes('srcset')).toBe('/img/daniel-400.jpg 400w, /img/daniel-800.jpg 800w')
    expect(wrapper.attributes('sizes')).toBe('(min-width: 768px) 400px, 100vw')
  })
})
