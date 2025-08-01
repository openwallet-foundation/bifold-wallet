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
    describe('when passing a function', () => {
      it('should merge the new theme into the existing theme', () => {
        const theme = new ThemeBuilder(bifoldTheme)
          .withOverrides((theme) => {
            expect(theme).toStrictEqual(bifoldTheme)

            return {
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
            }
          })
          .build()

        expect(theme.Buttons.critical).toStrictEqual({
          ...bifoldTheme.Buttons.critical,
          padding: 0,
          margin: -1,
        })
        expect(theme.TextTheme.headingOne).toStrictEqual({
          ...bifoldTheme.TextTheme.headingOne,
          margin: -1,
        })
      })

      it('should override existing properties in the default theme', () => {
        const theme = new ThemeBuilder(bifoldTheme)
          .withOverrides((theme) => {
            expect(theme).toStrictEqual(bifoldTheme)

            return { Buttons: { critical: { padding: -1 } } }
          })
          .build()

        expect(theme.Buttons.critical).toStrictEqual({
          ...bifoldTheme.Buttons.critical,
          padding: -1,
        })
      })

      it('should add new nested properties to the theme', () => {
        const theme = new ThemeBuilder(bifoldTheme)
          .withOverrides((theme) => {
            expect(theme).toStrictEqual(bifoldTheme)

            return { Buttons: { critical: { aspectRatio: 'value' } } }
          })
          .build()

        expect(theme.Buttons.critical?.aspectRatio).toStrictEqual('value')
      })

      it('should not override the entire theme when merging', () => {
        const theme = new ThemeBuilder(bifoldTheme).withOverrides(() => ({} as any)).build()

        expect(theme).toStrictEqual(bifoldTheme)
      })

      it('should chain multiple merges', () => {
        const theme = new ThemeBuilder(bifoldTheme)
          .withOverrides({
            Buttons: {
              critical: {
                width: -1,
              },
            },
          })
          .withOverrides((theme) => {
            expect(theme).toStrictEqual({
              ...bifoldTheme,
              Buttons: {
                ...bifoldTheme.Buttons,
                critical: {
                  ...bifoldTheme.Buttons.critical,
                  width: -1,
                },
              },
            })

            return { Buttons: { critical: { padding: -1 } } }
          })
          .withOverrides((theme) => {
            expect(theme.Buttons.critical?.padding).toEqual(-1)

            return { Buttons: { critical: { padding: 0, borderRadius: -1 } } }
          })
          .build()

        expect(theme.Buttons.critical?.padding).toEqual(0)
        expect(theme.Buttons.critical?.borderRadius).toEqual(-1)
        expect(theme.Buttons.critical?.width).toEqual(-1)
      })

      it('should allow overriding properties to undefined', () => {
        const theme = new ThemeBuilder(bifoldTheme)
          .withOverrides((theme) => {
            expect(theme).toStrictEqual(bifoldTheme)

            return { Buttons: { critical: { padding: undefined } } }
          })
          .build()

        expect(theme.Buttons.critical).toBeDefined()
        expect(theme.Buttons.critical?.padding).toBeUndefined()
      })

      it('passing an no properties should not change the theme', () => {
        const theme = new ThemeBuilder(bifoldTheme)
          .withOverrides((theme) => {
            expect(theme).toStrictEqual(bifoldTheme)
            return {
              Buttons: { critical: {} },
            }
          })
          .build()

        expect(theme).toStrictEqual(bifoldTheme)
      })

      it('should override a property to undefined at the property level', () => {
        const theme = new ThemeBuilder(bifoldTheme)
          .withOverrides((theme) => {
            expect(theme).toStrictEqual(bifoldTheme)

            return {
              Buttons: {
                criticalText: {
                  fontSize: 12,
                },
                critical: undefined,
              },
            }
          })
          // This should not override the buttons.critical section
          .withOverrides(() => ({
            Buttons: { criticalText: { fontSize: 13 } },
          }))
          .build()

        expect(theme.Buttons.critical).toBeUndefined()
        expect(theme.Buttons.criticalText?.fontSize).toEqual(13)
      })

      it('should override a property to undefined at the theme section level', () => {
        const theme = new ThemeBuilder(bifoldTheme)
          .withOverrides((theme) => {
            expect(theme).toStrictEqual(bifoldTheme)

            return { Buttons: undefined }
          })
          // This should not override the buttons section
          .withOverrides(() => ({}))
          .build()

        expect(theme.Buttons).toBeUndefined()
      })
    })

    describe('when passing an object', () => {
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
          padding: 0,
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

        expect(theme.Buttons.critical?.aspectRatio).toStrictEqual('value')
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

        expect(theme.Buttons.critical?.padding).toEqual(-1)
        expect(theme.Buttons.critical?.borderRadius).toEqual(-1)
      })

      it('should allow overriding properties to undefined', () => {
        const theme = new ThemeBuilder(bifoldTheme)
          .withOverrides({ Buttons: { critical: { padding: undefined } } })
          .build()

        expect(theme.Buttons.critical).toBeDefined()
        expect(theme.Buttons.critical?.padding).toBeUndefined()
      })

      it('passing an no properties should not change the theme', () => {
        const theme = new ThemeBuilder(bifoldTheme).withOverrides({ Buttons: { critical: {} } }).build()

        expect(theme).toStrictEqual(bifoldTheme)
      })
    })
  })

  describe('setColorPalette', () => {
    it('should set the color palette for the theme', () => {
      const theme = new ThemeBuilder(bifoldTheme)
        .setColorPalette({
          ...bifoldTheme.ColorPalette,
          brand: {
            ...bifoldTheme.ColorPalette.brand,
            primary: 'TEST',
          },
        })
        .build()

      expect(theme.ColorPalette.brand.primary).toEqual('TEST')
    })

    it('should not override the entire color palette when building: sanity check', () => {
      const theme = new ThemeBuilder(bifoldTheme)
        .setColorPalette({
          ...bifoldTheme.ColorPalette,
          brand: {
            ...bifoldTheme.ColorPalette.brand,
            primary: 'TEST',
          },
        })
        .withOverrides({ Buttons: { critical: { padding: -1 } } })
        .build()

      expect(theme.ColorPalette.brand.primary).toEqual('TEST')
      expect(theme.Buttons.critical?.padding).toEqual(-1)
      // Ensure the color palette is being applied to the dependent properties
      expect(theme.Inputs.inputSelected.borderColor).toEqual('TEST')
    })

    it('should set the color palette and be able to override it', () => {
      const theme = new ThemeBuilder(bifoldTheme)
        .setColorPalette({
          ...bifoldTheme.ColorPalette,
          brand: {
            ...bifoldTheme.ColorPalette.brand,
            primary: 'TEST',
          },
        })
        .withOverrides({ ColorPalette: { brand: { primary: 'OVERRIDE' } } })
        .build()

      expect(theme.ColorPalette.brand.primary).toEqual('OVERRIDE')
      // Ensure the color palette is being applied to the dependent properties
      expect(theme.Inputs.inputSelected.borderColor).toEqual('OVERRIDE')
    })

    it('should be able to override a value to undefined', () => {
      const theme = new ThemeBuilder(bifoldTheme)
        .withOverrides({ ColorPalette: { brand: { primary: undefined } } })
        .build()

      expect(theme.ColorPalette.brand.primary).toBeUndefined()
      // Ensure the color palette is being applied to the dependent properties
      expect(theme.Inputs.inputSelected.borderColor).toBeUndefined()
    })
  })
})
