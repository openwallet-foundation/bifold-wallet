import { StyleSheet } from 'react-native'

interface ColorTheme {
  mainColor: string
  activeMain: string
  textColor: string
  backgroundColor: string
  shadow: string
  green: string
  red: string
  white: string
  transparent: string
}

export const Colors: ColorTheme = {
  mainColor: '#35823f',
  activeMain: '#003366B3',
  textColor: '#fff',
  backgroundColor: '#000',
  shadow: '#1c1c1e',
  white: '#ffffff',
  green: '#2d6e35',
  red: '#de3333',
  transparent: '#FFFFFF00',
}

export const Buttons = StyleSheet.create({
  primary: {
    padding: 16,
    borderRadius: 4,
    backgroundColor: Colors.mainColor,
  },
  primaryText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center',
  },
})
