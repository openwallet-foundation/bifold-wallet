import { ITheme } from 'theme'
import lodash from 'lodash'

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? (T[P] extends (...args: any[]) => any ? T[P] : DeepPartial<T[P]>) : T[P]
}

// ThemeBuilder is a utility class to extend the bifold theme with additional properties.
export class ThemeBuilder {
  private theme: ITheme

  constructor(theme: ITheme) {
    this.theme = theme
  }

  /**
   * Extends the current theme with a partial theme object.
   *
   * @example new ThemeBuilder(theme).extendTheme({ Buttons: { primary: { color: 'red' } } })
   *
   * @param {DeepPartial<ITheme>} themeChunk - A partial theme object to merge with the current theme.
   * @return {ThemeBuilder} - Returns the instance of ThemeBuilder for method chaining.
   */
  extendTheme(themeChunk: DeepPartial<ITheme>) {
    this.theme = lodash.merge(this.theme, themeChunk)

    return this
  }
}
