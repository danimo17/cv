import type { Meme } from '#shared/types/giphy'

const HISTORY_SIZE = 5

export const useHeroStore = defineStore('hero', () => {
  // #region State
  const selected = ref<Meme | null>(null)
  const history = ref<Meme[]>([])
  // #endregion

  // #region Getters
  const hasMeme = computed(() => selected.value !== null)
  // #endregion

  // #region Methods
  function select(meme: Meme) {
    selected.value = meme
    history.value = [meme, ...history.value.filter((m) => m.id !== meme.id)].slice(0, HISTORY_SIZE)
  }

  function reset() {
    selected.value = null
  }
  // #endregion

  return { selected, history, hasMeme, select, reset }
})
