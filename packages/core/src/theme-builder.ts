import {
  IColorPalette,
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
export type DeepPartial<T> = T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T

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
   * Extension of the lodash.merge function that merges two objects deeply,
   * while preserving explicit undefined values in the source object.
   *
   * @param {T} target - The target object to merge into.
   * @param {DeepPartial<T>} source - The source object to merge from.
   * @returns {*} {T} Returns the merged object.
   */
  private _merge<T extends object>(target: T, source: DeepPartial<T>): T {
    // note: without the empty object, lodash.merge will mutate the original theme overrides,
    // and not properly update the nested properties
    return lodash.mergeWith({}, target, source, (objValue, srcValue, key, obj) => {
      // If source explicitly sets the value to undefined, keep it as undefined
      if (objValue !== srcValue && typeof srcValue === 'undefined') {
        obj[key] = undefined
      }
    })
  }

  /**
   * Sets the color pallet for the theme.
   *
   * Note: This method is mostly a convenience method to set the color pallet for the theme.
   * The same can be achieved by directly modifying the theme object using the `withOverrides` method.
   *
   * @param {IColorPalette} colorPalette - The color pallet to set for the theme.
   * @returns {*} {ThemeBuilder} Returns the instance of ThemeBuilder for method chaining.
   */
  setColorPalette(colorPalette: IColorPalette): this {
    this.withOverrides({
      ColorPalette: colorPalette,
    })

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
   * .withOverrides({ Buttons: { spacing: 10 }}) // => { Buttons: { color: 'red', size: 'large', spacing: 10 }}
   *
   * @example
   * new ThemeBuilder({ Buttons: { critical: { padding: 10, margin: 0 }}})
   * .withOverrides((theme) => ({
   *  Buttons: { critical: { padding: 0, margin: -1 } },
   * })) // => { Buttons: { critical: { padding: 0, margin: -1 } }}
   *
   * @param {DeepPartial<ITheme> | ((theme: ITheme) => DeepPartial<ITheme>) } themeOverrides A partial theme object to merge with the current theme or a callback function that receives the current theme and returns a partial theme object.
   * @returns {*} {ThemeBuilder} Returns the instance of ThemeBuilder for method chaining.
   */
  withOverrides(themeOverrides: DeepPartial<ITheme> | ((theme: ITheme) => DeepPartial<ITheme>)): this {
    const resolvedOverrides = typeof themeOverrides === 'function' ? themeOverrides(this._theme) : themeOverrides

    this._themeOverrides = this._merge(this._themeOverrides, resolvedOverrides)

    // Rebuild the theme with the new overrides so following chained calls will use the updated theme.
    this._theme = this.build()

    // Return the instance for method chaining
    return this
  }

  /**
   * Builds and returns the final theme object.
   *
   * @returns {*} {ITheme} Returns the final theme object.
   */
  build(): ITheme {
    // Step 1. Merge the theme overrides onto the original theme, producing the new base theme.
    const baseTheme = this._merge(this._theme, this._themeOverrides)

    if (lodash.isEqual(baseTheme, this._theme)) {
      // If the base theme is equal to the current theme, return the current theme
      // This avoids unnecessary recomputation of dependent themes
      return this._theme
    }

    // Step 2. Generate computed properties that depend on the base theme
    const dependentThemes: Partial<ITheme> = {
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

    /**
     * Step 3. Merge all together - base + generated + overrides
     *
     * Why do we apply the overrides after the dependent themes?
     * Because the `dependentThemes` contain additional properties that may have
     * been modified by the overrides previously.
     */
    const newBaseTheme = this._merge(baseTheme, dependentThemes)
    this._theme = this._merge(newBaseTheme, this._themeOverrides)

    return this._theme
  }
}
