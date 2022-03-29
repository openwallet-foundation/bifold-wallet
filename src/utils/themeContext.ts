import { createContext, useContext } from 'react'

import { Theme, defaultTheme } from '../theme'

export const ThemeContext = createContext<Theme>(defaultTheme)
export const ThemeProvider = ThemeContext.Provider

export const useThemeContext = () => useContext(ThemeContext)
