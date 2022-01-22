import { StyleSheet } from 'react-native'

type BaseColor = Record<string, string>

export const ActiveOpacity = 0.7

export const borderRadius = 4

export const BaseColors: BaseColor = {
  black: '#000000',
  darkGrey: '#1C1C1E',
  green: '#2D6E35',
  red: '#DE3333',
  white: '#FFFFFF',
  yellow: '#FCBA19',
  mediumBlue: '#2E8540',
  lightBlue: '#87B37A',
  transparent: 'rgba(0, 0, 0, 0)',
}

interface ColorTheme extends BaseColor {
  primary: string
  primaryActive: string
  text: string
  background: string
  shadow: string
  toastSuccess: string
  toastError: string
  toastInfo: string
  transparent: string
  accent: string
  borderLight: string
  backgroundLight: string
}

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

export const Colors: ColorTheme = {
  primary: '#35823f',
  primaryActive: '#003366B3',
  text: BaseColors.white,
  background: BaseColors.black,
  shadow: BaseColors.darkGrey,
  toastSuccess: BaseColors.green,
  toastError: BaseColors.red,
  toastInfo: BaseColors.black,
  accent: BaseColors.yellow,
  borderLight: BaseColors.mediumBlue,
  backgroundLight: BaseColors.lightBlue,
  transparent: BaseColors.transparent,
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
    backgroundColor: 'rgba(66, 128, 62, 0.3)',
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
    backgroundColor: Colors.white,
  },
  secondaryDisabled: {
    padding: 16,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'rgba(0, 51, 102, 0.7)',
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
    color: 'rgba(0, 51, 102, 0.7)',
    textAlign: 'center',
  },
})
