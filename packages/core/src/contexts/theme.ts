import { createContext, useContext } from 'react'

import { theme, ITheme } from '../theme'

export const ThemeContext = createContext<ITheme>(theme)

export const ThemeProvider = ThemeContext.Provider

export const useTheme = () => useContext(ThemeContext)
