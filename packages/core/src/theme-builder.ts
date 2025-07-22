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

/**
 * DeepPartial is a utility type that recursively makes all properties of a type optional.
 */
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

  /**
   * Creates an instance of ThemeBuilder.
   *
   * @param {ITheme} baseTheme - The initial theme object to extend.
   */
  constructor(baseTheme: ITheme) {
    this._theme = baseTheme
  }

  /**
   * Sets the color pallet for the theme.
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
    /**
     * clone then merge the themeOverrides into the current theme
     * note: Without the empty object, lodash.merge will mutate the original theme
     * and not properly update the nested properties
     */
    this._theme = lodash.merge({}, this._theme, themeOverrides)

    // Return the instance for method chaining
    return this
  }

  /**
   * Builds and returns the final theme object.
   *
   * @returns {*} {ITheme} Returns the final theme object.
   */
  build(): ITheme {
    /**
     * Note: This is to ensure that the theme is built with all the necessary dependencies.
     * If in a previous call to `withOverrides` the user has updated a theme dependency,
     * this will ensure that the theme is built with the latest version of that dependency.
     */
    this._theme = lodash.merge(
      /**
       * Note: The order of this `merge` is opposite to the order of the `withOverrides` merge.
       * This is to apply the latest version of the theme over the injected themes.
       * This way, if the user has updated a theme dependency, it will applied to the final theme. ie: ColorPallet
       */
      {},
      {
        TextTheme: createTextTheme(this._theme),
        InputInlineMessage: createInputInlineMessageTheme(this._theme),
        Inputs: createInputsTheme(this._theme),
        Buttons: createButtonsTheme(this._theme),
        ListItems: createListItemsTheme(this._theme),
        TabTheme: createTabTheme(this._theme),
        NavigationTheme: createNavigationTheme(this._theme),
        HomeTheme: createHomeTheme(this._theme),
        SettingsTheme: createSettingsTheme(this._theme),
        ChatTheme: createChatTheme(this._theme),
        OnboardingTheme: createOnboardingTheme(this._theme),
        DialogTheme: createDialogTheme(this._theme),
        LoadingTheme: createLoadingTheme(this._theme),
        PINInputTheme: createPINInputTheme(this._theme),
      },
      this._theme
    )

    return this._theme
  }
}
