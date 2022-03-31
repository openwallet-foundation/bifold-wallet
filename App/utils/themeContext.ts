import { createContext, useContext } from 'react'

import { defaultTheme, Theme } from '../theme'

export { defaultTheme } from '../theme'
export type { Theme } from '../theme'
export const ThemeContext = createContext<Theme>(defaultTheme)
export const ThemeProvider = ThemeContext.Provider

export const useThemeContext = () => useContext(ThemeContext)
