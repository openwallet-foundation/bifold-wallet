import { bifoldTheme } from '../../src/theme'
import * as themeContext from '../../src/contexts/theme'

export const mockThemeContext = {
  setTheme: jest.fn(),
  ...bifoldTheme,
}

export const useThemeSpy = jest.spyOn(themeContext, 'useTheme').mockImplementation(() => mockThemeContext)
