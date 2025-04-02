import { ITextTheme } from '../../theme'
import { useTheme } from '../../contexts/theme'
import { Text, type TextProps } from 'react-native'
import React from 'react'

export type ThemedTextProps = TextProps & {
  variant?: keyof ITextTheme
}

/**
 *
 * @param {variant} variant - A key of the TextTheme object that is defined in the theme file
 * @param {maxFontSizeMultiplier} maxFontSizeMultiplier - It allows to override the maxFontSizeMultiplier. Default value is 2
 * @param {style} style - It allows to add extra styles to the component in addition to the one coming from the variant option
 * @param {rest} rest - It allows to pass the rest of the props to the Text component
 * @returns
 */
export function ThemedText({ variant = 'normal', maxFontSizeMultiplier, style, ...rest }: ThemedTextProps) {
  const { TextTheme, maxFontSizeMultiplier: maxFontSize } = useTheme()

  return (
    <Text maxFontSizeMultiplier={maxFontSizeMultiplier ?? maxFontSize} style={[TextTheme[variant], style]} {...rest} />
  )
}
