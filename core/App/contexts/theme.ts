import { createContext, useContext } from 'react'

import { theme, Theme } from '../theme'

export const ThemeContext = createContext<Theme>(theme)

export const ThemeProvider = ThemeContext.Provider

export const useTheme = () => useContext(ThemeContext)
