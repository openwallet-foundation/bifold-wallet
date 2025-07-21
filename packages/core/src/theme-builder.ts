import { ITheme } from 'theme'
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
    // clone then merge the themeOverrides into the current theme
    // note: Without the empty object, lodash.merge will mutate the original theme
    // and not properly update the nested properties
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
    return this._theme
  }
}
