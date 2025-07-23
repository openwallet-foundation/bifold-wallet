import { bifoldTheme } from '../../src/theme'
import { ThemeBuilder } from '../../src/theme-builder'

describe('Theme Builder', () => {
  describe('getTheme', () => {
    it('should return the theme', () => {
      const theme = new ThemeBuilder(bifoldTheme).build()

      expect(theme).toStrictEqual(bifoldTheme)
    })
  })

  describe('withOverrides', () => {
    it('should merge the new theme into the existing theme', () => {
      const theme = new ThemeBuilder(bifoldTheme)
        .withOverrides({
          Buttons: {
            critical: {
              padding: 0,
              margin: -1,
            },
          },
          TextTheme: {
            headingOne: {
              margin: -1,
            },
          },
        })
        .build()

      expect(theme.Buttons.critical).toStrictEqual({
        ...bifoldTheme.Buttons.critical,
        margin: -1,
      })
      expect(theme.TextTheme.headingOne).toStrictEqual({
        ...bifoldTheme.TextTheme.headingOne,
        margin: -1,
      })
    })

    it('should override existing properties in the default theme', () => {
      const theme = new ThemeBuilder(bifoldTheme).withOverrides({ Buttons: { critical: { padding: -1 } } }).build()

      expect(theme.Buttons.critical).toStrictEqual({
        ...bifoldTheme.Buttons.critical,
        padding: -1,
      })
    })

    it('should add new nested properties to the theme', () => {
      const theme = new ThemeBuilder(bifoldTheme)
        .withOverrides({ Buttons: { critical: { aspectRatio: 'value' } } })
        .build()

      expect(theme.Buttons.critical.aspectRatio).toStrictEqual('value')
    })

    it('should not override the entire theme when merging', () => {
      const theme = new ThemeBuilder(bifoldTheme).withOverrides({} as any).build()

      expect(theme).toStrictEqual(bifoldTheme)
    })

    it('should chain multiple merges', () => {
      const theme = new ThemeBuilder(bifoldTheme)
        .withOverrides({ Buttons: { critical: { padding: -1 } } })
        .withOverrides({ Buttons: { critical: { borderRadius: -1 } } })
        .build()

      expect(theme.Buttons.critical.padding).toEqual(-1)
      expect(theme.Buttons.critical.borderRadius).toEqual(-1)
    })
  })

  describe('setColorPalette', () => {
    it('should set the color pallet for the theme', () => {
      const theme = new ThemeBuilder(bifoldTheme)
        .setColorPalette({
          ...bifoldTheme.ColorPallet,
          brand: {
            ...bifoldTheme.ColorPallet.brand,
            primary: 'TEST',
          },
        })
        .build()

      expect(theme.ColorPallet.brand.primary).toEqual('TEST')
    })

    it('should not override the entire color pallet when building: sanity check', () => {
      const theme = new ThemeBuilder(bifoldTheme)
        .setColorPalette({
          ...bifoldTheme.ColorPallet,
          brand: {
            ...bifoldTheme.ColorPallet.brand,
            primary: 'TEST',
          },
        })
        .withOverrides({ Buttons: { critical: { padding: -1 } } })
        .build()

      expect(theme.ColorPallet.brand.primary).toEqual('TEST')
      expect(theme.Buttons.critical.padding).toEqual(-1)
      // Ensure the color pallet is being applied to the dependent properties
      expect(theme.Inputs.inputSelected.borderColor).toEqual('TEST')
    })
  })
})
