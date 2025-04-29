import { createContext, useCallback, useContext, useMemo } from 'react'

import { bifoldTheme, ITheme } from '../theme'
import { useStore } from './store'
import { DispatchAction } from './reducers/store'

export interface IThemeContext extends ITheme {
  setTheme: (themeName: string) => void
}

const ThemeContext = createContext<IThemeContext>({
  ...bifoldTheme,
  setTheme: () => {},
})

export interface ThemeProviderProps extends React.PropsWithChildren {
  themes: ITheme[]
  defaultThemeName: string
}

export const ThemeProvider = ({ themes, defaultThemeName, children }: ThemeProviderProps) => {
  const [store, dispatch] = useStore()

  const activeTheme = useMemo(() => {
    return (
      (store.preferences.theme && themes.find((t) => t.themeName === store.preferences.theme)) ||
      themes.find((t) => t.themeName === defaultThemeName) ||
      themes[0]
    )
  }, [store.preferences.theme, themes, defaultThemeName])

  const setTheme = useCallback(
    (themeName: string) => {
      const newTheme = themes.find((t) => t.themeName === themeName) || themes[0]
      dispatch({ type: DispatchAction.SET_THEME, payload: [newTheme.themeName] })
    },
    [themes, dispatch]
  )

  // prevent re-rendering of the context value
  const value = useMemo(() => {
    return {
      ...activeTheme,
      setTheme,
    }
  }, [activeTheme, setTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
