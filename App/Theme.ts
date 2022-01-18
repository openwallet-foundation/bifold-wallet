import { StyleSheet } from 'react-native'

interface ColorTheme {
  primary: string
  primaryActive: string
  text: string
  background: string
  shadow: string
  toastSuccess: string
  toastError: string
  toastInfo: string
  white: string
  transparent: string
}

export const Colors: ColorTheme = {
  primary: '#35823f',
  primaryActive: '#003366B3',
  text: '#fff',
  background: '#000',
  shadow: '#1c1c1e',
  white: '#ffffff',
  toastSuccess: '#2d6e35',
  toastError: '#de3333',
  toastInfo: 'yellow',
  transparent: '#FFFFFF00',
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
