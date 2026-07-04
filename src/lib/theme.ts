export type ThemeName = 'dark' | 'light'

const STORAGE_KEY = 'eo-theme'

export function getStoredTheme(): ThemeName {
  if (typeof window === 'undefined') return 'dark'
  return window.localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark'
}

export function applyTheme(theme: ThemeName) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  window.localStorage.setItem(STORAGE_KEY, theme)
}
