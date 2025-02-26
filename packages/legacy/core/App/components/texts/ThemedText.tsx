import { ITextTheme } from '../../theme'
import { useTheme } from '../../contexts/theme'
import { Text, type TextProps } from 'react-native'
import { TOKENS, useServices } from '../../container-api'

export type ThemedTextProps = TextProps & {
  variant?: keyof ITextTheme
}

export function ThemedText({ variant = 'normal', maxFontSizeMultiplier, style, ...rest }: ThemedTextProps) {
  const { TextTheme } = useTheme()
  const [{ accessibilityMaxFontSizeMultiplier = 2 }] = useServices([TOKENS.CONFIG])

  return (
    <Text
      maxFontSizeMultiplier={maxFontSizeMultiplier ?? accessibilityMaxFontSizeMultiplier}
      style={[TextTheme[variant], style]}
      {...rest}
    />
  )
}
