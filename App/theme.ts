import { StyleSheet } from 'react-native'

type BaseColor = Record<string, string>

export const BaseColors: BaseColor = {
  black: '#000000',
  darkGrey: '#1C1C1E',
  green: '#2D6E35',
  red: '#DE3333',
  white: '#FFFFFF',
  yellow: 'yellow',
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
  transparent: BaseColors.transparent,
  ...BaseColors,
}

export const Buttons = StyleSheet.create({
  primary: {
    padding: 16,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  primaryText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center',
  },
})

export const borderRadius = 5
