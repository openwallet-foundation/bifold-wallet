import {
  IColorPallet,
  ITheme,
  createButtonsTheme,
  createChatTheme,
  createHomeTheme,
  createInputInlineMessageTheme,
  createInputsTheme,
  createListItemsTheme,
  createNavigationTheme,
  createSettingsTheme,
  createTabTheme,
  createTextTheme,
  createOnboardingTheme,
  createDialogTheme,
  createLoadingTheme,
  createPINInputTheme,
} from './theme'
import lodash from 'lodash'

// DeepPartial is a utility type that recursively makes all properties of a type optional.
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? (T[P] extends (...args: any[]) => any ? T[P] : DeepPartial<T[P]>) : T[P]
}

/**
 * ThemeBuilder is a utility class to extend an existing theme with additional properties.
 *
 * @class ThemeBuilder
 */
export class ThemeBuilder {
  private _theme: ITheme
  private _themeOverrides: DeepPartial<ITheme>

  /**
   * Creates an instance of ThemeBuilder.
   *
   * @param {ITheme} baseTheme - The initial theme object to extend.
   */
  constructor(baseTheme: ITheme) {
    this._theme = baseTheme
    this._themeOverrides = {}
  }

  /**
   * Sets the color pallet for the theme.
   *
   * Note: This method is mostly a convenience method to set the color pallet for the theme.
   * The same can be achieved by directly modifying the theme object using the `withOverrides` method.
   *
   * @param {IColorPallet} colorPallet - The color pallet to set for the theme.
   * @returns {*} {ThemeBuilder} Returns the instance of ThemeBuilder for method chaining.
   */
  setColorPallet(colorPallet: IColorPallet): ThemeBuilder {
    this._theme.ColorPallet = colorPallet

    return this
  }

  /**
   * Overrides properties in the current theme with the provided themeOverrides.
   *
   * Note: This will overwrite existing properties in the current theme with those from the provided themeOverrides.
   *
   * @example
   * new ThemeBuilder({ Buttons: { color: 'purple', size: 'large' }})
   * .withOverrides({ Buttons: { color: 'red' }})
   * .withOverrides({ Buttons: { spacing: 10 }}) // { Buttons: { color: 'red', size: 'large', spacing: 10 }}
   *
   * @param {DeepPartial<ITheme>} themeOverrides - A partial theme object to merge with the current theme.
   * @returns {*} {ThemeBuilder} Returns the instance of ThemeBuilder for method chaining.
   */
  withOverrides(themeOverrides: DeepPartial<ITheme>) {
    // note: without the empty object, lodash.merge will mutate the original theme overrides,
    // and not properly update the nested properties
    this._themeOverrides = lodash.merge({}, this._themeOverrides, themeOverrides)

    // Return the instance for method chaining
    return this
  }

  /**
   * Builds and returns the final theme object.
   *
   * @returns {*} {ITheme} Returns the final theme object.
   */
  build(): ITheme {
    // 1. Merge the theme overrides onto the original theme, producing the new base theme.
    const baseTheme = lodash.merge({}, this._theme, this._themeOverrides)

    // 2. Create dependent theme slices based on the new base theme.
    const dependentThemeSlices = {
      TextTheme: createTextTheme(baseTheme),
      InputInlineMessage: createInputInlineMessageTheme(baseTheme),
      Inputs: createInputsTheme(baseTheme),
      Buttons: createButtonsTheme(baseTheme),
      ListItems: createListItemsTheme(baseTheme),
      TabTheme: createTabTheme(baseTheme),
      NavigationTheme: createNavigationTheme(baseTheme),
      HomeTheme: createHomeTheme(baseTheme),
      SettingsTheme: createSettingsTheme(baseTheme),
      ChatTheme: createChatTheme(baseTheme),
      OnboardingTheme: createOnboardingTheme(baseTheme),
      DialogTheme: createDialogTheme(baseTheme),
      LoadingTheme: createLoadingTheme(baseTheme),
      PINInputTheme: createPINInputTheme(baseTheme),
    }

    // 3. Merge the base theme with the dependent themes and the theme overrides.
    // Why do we apply the overrides after the dependent themes?
    // Because the `dependentThemeSlices` contain additional properties that may have
    // been modified by the overrides previously.
    this._theme = lodash.merge({}, baseTheme, dependentThemeSlices, this._themeOverrides)

    return this._theme
  }
}
