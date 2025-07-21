import { ITheme } from 'theme'
import lodash from 'lodash'

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
   * Extends the current theme with a partial theme object.
   *
   * @example new ThemeBuilder(theme).mergeTheme({ Buttons: { primary: { color: 'red' } } })
   *
   * @param {DeepPartial<ITheme>} themeChunk - A partial theme object to merge with the current theme.
   * @returns {*} {ThemeBuilder} Returns the instance of ThemeBuilder for method chaining.
   */
  mergeTheme(themeChunk: DeepPartial<ITheme>) {
    this._theme = lodash.merge(this._theme, themeChunk)

    // Return the instance for method chaining
    return this
  }

  /**
   * Retrieves the current theme.
   *
   * @returns {*} {ITheme} Returns the current theme object.
   */
  getTheme(): ITheme {
    return this._theme
  }
}
