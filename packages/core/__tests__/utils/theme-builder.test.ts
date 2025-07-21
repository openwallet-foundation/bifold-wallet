import { ThemeBuilder } from '../../src/theme-builder'

describe('Theme Builder', () => {
  describe('getTheme', () => {
    it('should return the theme', () => {
      const themeBuilder = new ThemeBuilder({ theme: 'test' } as any)

      const theme = themeBuilder.getTheme()

      expect(theme).toStrictEqual({
        theme: 'test',
      })
    })
  })

  describe('mergeTheme', () => {
    it('should merge the injected theme with the default theme', () => {
      const themeBuilder = new ThemeBuilder({ theme: 'test' } as any)

      const mergedTheme = themeBuilder.mergeTheme({ additional: 'value' } as any)

      expect(mergedTheme.getTheme()).toStrictEqual({
        theme: 'test',
        additional: 'value',
      })
    })

    it('should override existing properties in the default theme', () => {
      const themeBuilder = new ThemeBuilder({ theme: { color: 'blue' } } as any)

      const mergedTheme = themeBuilder.mergeTheme({ theme: { color: 'red' } } as any)

      expect(mergedTheme.getTheme()).toStrictEqual({
        theme: { color: 'red' },
      })
    })

    it('should add new nested properties to the theme', () => {
      const themeBuilder = new ThemeBuilder({ theme: { color: 'blue' } } as any)

      const mergedTheme = themeBuilder.mergeTheme({ theme: { nested: { property: 'value' } } } as any)

      expect(mergedTheme.getTheme()).toStrictEqual({
        theme: { color: 'blue', nested: { property: 'value' } },
      })
    })

    it('should not override the entire theme when merging', () => {
      const themeBuilder = new ThemeBuilder({ theme: { color: 'blue', size: 'medium' } } as any)

      const mergedTheme = themeBuilder.mergeTheme({} as any)

      expect(mergedTheme.getTheme()).toStrictEqual({
        theme: { color: 'blue', size: 'medium' },
      })
    })
  })
})
