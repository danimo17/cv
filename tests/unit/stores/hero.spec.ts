import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import type { Meme } from '#shared/types/giphy'
import { useHeroStore } from '~/stores/hero'

function meme(id: string): Meme {
  return { id, title: `Meme ${id}`, preview: `p-${id}`, full: `f-${id}`, width: 480, height: 480 }
}

describe('useHeroStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts empty', () => {
    const hero = useHeroStore()
    expect(hero.selected).toBeNull()
    expect(hero.hasMeme).toBe(false)
    expect(hero.history).toEqual([])
  })

  it('select sets selected and prepends history', () => {
    const hero = useHeroStore()
    hero.select(meme('a'))
    hero.select(meme('b'))
    expect(hero.selected?.id).toBe('b')
    expect(hero.hasMeme).toBe(true)
    expect(hero.history.map((m) => m.id)).toEqual(['b', 'a'])
  })

  it('history dedupes by id and moves the repeated meme to the front', () => {
    const hero = useHeroStore()
    hero.select(meme('a'))
    hero.select(meme('b'))
    hero.select(meme('a'))
    expect(hero.history.map((m) => m.id)).toEqual(['a', 'b'])
  })

  it('history keeps at most 5 entries', () => {
    const hero = useHeroStore()
    for (const id of ['1', '2', '3', '4', '5', '6', '7']) hero.select(meme(id))
    expect(hero.history).toHaveLength(5)
    expect(hero.history.map((m) => m.id)).toEqual(['7', '6', '5', '4', '3'])
  })

  it('reset clears selected but keeps history', () => {
    const hero = useHeroStore()
    hero.select(meme('a'))
    hero.reset()
    expect(hero.selected).toBeNull()
    expect(hero.hasMeme).toBe(false)
    expect(hero.history.map((m) => m.id)).toEqual(['a'])
  })
})
