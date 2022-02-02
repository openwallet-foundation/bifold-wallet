import { StyleSheet } from 'react-native'

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
  primary: '#003366',
  highlight: '#FCBA19',
  primaryBackground: '#F2F2F2',
  secondaryBackground: '#FFFFFF',
}

const SemanticColors: SemanticColors = {
  error: '#D8292F',
  success: '#2E8540',
  focus: '#3399ff',
}

const NotificationColors: NotificationColors = {
  success: '#DFF0D8',
  successBorder: '#D6E9C6',
  successIcon: '#2E8540',
  successText: '#2E8540',
  info: '#D9EAF7',
  infoBorder: '#B9CEDE',
  infoIcon: '#0099FF',
  infoText: '#0099FF',
  warn: '#F9F1C6',
  warnBorder: '#FAEBCC',
  warnIcon: '#6C4A00',
  warnText: '#6C4A00',
  error: '#F2DEDE',
  errorBorder: '#EBCCD1',
  errorIcon: '#D8292F',
  errorText: '#D8292F',
}

const GrayscaleColors: GrayscaleColors = {
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

interface CredentialTheme {
  background: string
}

interface CredentialOfferTheme {
  background: string
}

interface ContactTheme {
  background: string
}

interface ModularViewTheme {
  background: string
}

interface ProofRequestTheme {
  background: string
}

interface SettingsTheme {
  background: string
}

interface SingleSelectBlockTheme {
  background: string
}

interface TextBoxTheme {
  background: string
  border: string
  text: string
}

export const Colors: ColorTheme = {
  accent: BaseColors.yellow,
  background: BaseColors.offWhite,
  backgroundLight: BaseColors.lightBlue,
  borderLight: BaseColors.mediumBlue,
  primary: BaseColors.darkBlue,
  primaryActive: BaseColors.darkBlueHeavyTransparent,
  shadow: BaseColors.darkGrey,
  text: BaseColors.darkGreyAlt,
  ...BaseColors,
  ...NotificationColors,
}

export const CredentialTheme: CredentialTheme = {
  background: Colors.white,
}

export const CredentialOfferTheme: CredentialOfferTheme = {
  background: Colors.white,
}

export const ContactTheme: ContactTheme = {
  background: Colors.white,
}

export const ModularViewTheme: ModularViewTheme = {
  background: Colors.backgroundLight,
}

export const ProofRequestTheme: ProofRequestTheme = {
  background: Colors.white,
}

export const SettingsTheme: SettingsTheme = {
  background: Colors.white,
}

export const SingleSelectBlockTheme: SingleSelectBlockTheme = {
  background: Colors.white,
}

export const TextBoxTheme: TextBoxTheme = {
  background: Colors.lightBlue,
  border: Colors.borderLight,
  text: Colors.text,
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
    borderRadius,
    backgroundColor: Colors.darkBlueHeavyTransparent,
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
    borderRadius,
    borderWidth,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  secondaryDisabled: {
    padding: 16,
    borderRadius,
    borderWidth,
    borderColor: Colors.darkBlueLightTransparent,
    backgroundColor: Colors.white,
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
    color: Colors.darkBlueLightTransparent,
    textAlign: 'center',
  },
})
