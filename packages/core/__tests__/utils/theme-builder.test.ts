import { bifoldTheme } from '../../src/theme'
import { ThemeBuilder } from '../../src/theme-builder'

describe('Theme Builder', () => {
  describe('getTheme', () => {
    it('should return the theme', () => {
      const theme = new ThemeBuilder(bifoldTheme).build()

      expect(theme).toStrictEqual({
        theme: 'test',
      })
    })
  })

  describe('withOverrides', () => {
    it('should merge the new theme into the existing theme', () => {
      const theme = new ThemeBuilder(bifoldTheme)
        .withOverrides({
          Buttons: {
            critical: {
              margin: 20,
            },
          },
        })
        .build()

      expect(theme).toStrictEqual({
        theme: 'test',
        additional: 'value',
      })
    })

    it('should override existing properties in the default theme', () => {
      const theme = new ThemeBuilder(bifoldTheme).withOverrides({ theme: { color: 'red' } } as any).build()

      expect(theme).toStrictEqual({
        theme: { color: 'red' },
      })
    })

    it('should add new nested properties to the theme', () => {
      const theme = new ThemeBuilder(bifoldTheme)
        .withOverrides({ theme: { nested: { property: 'value' } } } as any)
        .build()

      expect(theme).toStrictEqual({
        theme: { color: 'blue', nested: { property: 'value' } },
      })
    })

    it('should not override the entire theme when merging', () => {
      const theme = new ThemeBuilder(bifoldTheme).withOverrides({} as any).build()

      expect(theme).toStrictEqual({
        theme: { color: 'blue', size: 'medium' },
      })
    })

    it('should chain multiple merges', () => {
      const theme = new ThemeBuilder(bifoldTheme)
        .withOverrides({ theme: { size: 'large' } } as any)
        .withOverrides({ theme: { padding: 10 } } as any)
        .withOverrides({ theme: { color: 'green' } } as any)
        .build()

      expect(theme).toStrictEqual({
        theme: { color: 'green', size: 'large', padding: 10 },
      })
    })

    it('should work with the real theme object: sanity check', () => {
      const theme = new ThemeBuilder(bifoldTheme)
        .withOverrides({
          themeName: 'test',
          Buttons: {
            critical: {
              padding: -1,
            },
          },
        })
        .build()

      expect(theme.themeName).toBe('test')
      expect(theme.Buttons.critical).toStrictEqual({
        ...bifoldTheme.Buttons.critical,
        padding: -1,
      })
    })
  })
})
