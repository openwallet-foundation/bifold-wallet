import { StyleSheet } from 'react-native'

// DEPRECATED:
type BaseColor = Record<string, string>

interface FontAttributes {
  fontSize: number
  fontWeight: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'
  color: string
}

interface TextTheme {
  headingOne: FontAttributes
  headingTwo: FontAttributes
  headingThree: FontAttributes
  headingFour: FontAttributes
  normal: FontAttributes
  label: FontAttributes
  caption: FontAttributes
}

interface BrandColors {
  primary: string
  highlight: string
  primaryBackground: string
  secondaryBackground: string
  link: string
}

interface SemanticColors {
  error: string
  success: string
  focus: string
}

interface NotificationColors {
  success: string
  successBorder: string
  successIcon: string
  successText: string
  info: string
  infoBorder: string
  infoIcon: string
  infoText: string
  warn: string
  warnBorder: string
  warnIcon: string
  warnText: string
  error: string
  errorBorder: string
  errorIcon: string
  errorText: string
}

interface GrayscaleColors {
  black: string
  darkGrey: string
  mediumGrey: string
  lightGrey: string
  veryLightGrey: string
  white: string
}

interface ColorPallet {
  brand: BrandColors
  semantic: SemanticColors
  notification: NotificationColors
  grayscale: GrayscaleColors
}

export const borderRadius = 4
export const heavyOpacity = 0.7
export const lightOpacity = 0.35
export const zeroOpacity = 0.0
export const borderWidth = 2

const BrandColors: BrandColors = {
  primary: '#42803E',
  highlight: '#FCBA19',
  primaryBackground: '#000000',
  secondaryBackground: '#313132',
  link: '#FFFFFF',
}

const SemanticColors: SemanticColors = {
  error: '#D8292F',
  success: '#2E8540',
  focus: '#3399ff',
}

const NotificationColors: NotificationColors = {
  success: '#313132',
  successBorder: '#2E8540',
  successIcon: '#2E8540',
  successText: '#FFFFFF',
  info: '#313132',
  infoBorder: '#0099FF',
  infoIcon: '#0099FF',
  infoText: '#FFFFFF',
  warn: '#313132',
  warnBorder: '#fcba19',
  warnIcon: '#fcba19',
  warnText: '#FFFFFF',
  error: '#313132',
  errorBorder: '#D8292F',
  errorIcon: '#D8292F',
  errorText: '#FFFFFF',
}

const GrayscaleColors: GrayscaleColors = {
  black: '#000000',
  darkGrey: '#313132',
  mediumGrey: '#606060',
  lightGrey: '#d3d3d3',
  veryLightGrey: '#f2f2f2',
  white: '#FFFFFF',
}

export const ColorPallet: ColorPallet = {
  brand: BrandColors,
  semantic: SemanticColors,
  notification: NotificationColors,
  grayscale: GrayscaleColors,
}

// DEPRECATED:
export const BaseColors: BaseColor = {
  black: '#000000',
  darkBlue: '#003366',
  darkBlueLightTransparent: `rgba(0, 51, 102, ${heavyOpacity})`,
  darkBlueHeavyTransparent: `rgba(0, 51, 102, ${lightOpacity})`,
  darkGreen: '#35823F',
  darkGreenLightTransparent: `rgba(53, 130, 63, ${heavyOpacity})`,
  darkGreenHeavyTransparent: `rgba(53, 130, 63, ${lightOpacity})`,
  darkGrey: '#1C1C1E',
  darkGreyAlt: '#313132',
  green: '#2D6E35',
  lightBlue: '#D9EAF7',
  lightGrey: '#D3D3D3',
  lightGreyAlt: '#F2F2F2',
  mediumBlue: '#B9CEDE',
  offWhite: '#F2F2F2',
  red: '#DE3333',
  transparent: `rgba(0, 0, 0, ${zeroOpacity})`,
  yellow: '#FCBA19',
  white: '#FFFFFF',
}

// DEPRECATED:
interface ColorTheme extends BaseColor {
  accent: string
  background: string
  backgroundLight: string
  borderLight: string
  primary: string
  primaryActive: string
  shadow: string
  text: string
}

// DEPRECATED:
export const Colors: ColorTheme = {
  accent: BaseColors.yellow,
  background: BaseColors.black,
  backgroundLight: BaseColors.lightGreen,
  borderLight: BaseColors.mediumGreen,
  primary: BaseColors.darkGreen,
  primaryActive: BaseColors.darkGreenHeavyTransparent,
  shadow: BaseColors.darkGrey,
  text: BaseColors.white,
  ...BaseColors,
}

export const TextTheme: TextTheme = {
  headingOne: {
    fontSize: 38,
    fontWeight: 'bold',
    color: Colors.text,
  },
  headingTwo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
  },
  headingThree: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.text,
  },
  headingFour: {
    fontSize: 21,
    fontWeight: 'bold',
    color: Colors.text,
  },
  normal: {
    fontSize: 18,
    fontWeight: 'normal',
    color: Colors.text,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
  },
  caption: {
    fontSize: 14,
    fontWeight: 'normal',
    color: Colors.text,
  },
}

export const Buttons = StyleSheet.create({
  primary: {
    padding: 16,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  primaryDisabled: {
    padding: 16,
    borderRadius: 4,
    backgroundColor: Colors.darkGreenHeavyTransparent,
  },
  primaryText: {
    ...TextTheme.normal,
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center',
  },
  primaryTextDisabled: {
    ...TextTheme.normal,
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center',
  },
  secondary: {
    padding: 16,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  secondaryDisabled: {
    padding: 16,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.darkGreenLightTransparent,
  },
  secondaryText: {
    ...TextTheme.normal,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
  },
  secondaryTextDisabled: {
    ...TextTheme.normal,
    fontWeight: 'bold',
    color: Colors.darkGreenLightTransparent,
    textAlign: 'center',
  },
})
