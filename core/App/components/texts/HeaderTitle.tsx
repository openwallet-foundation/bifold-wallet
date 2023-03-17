import React from 'react'
import { Text, StyleSheet } from 'react-native'

import { useTheme } from '../../contexts/theme'

interface Props {
  children: React.ReactNode
}

// this component is used to create a custom header title that doesn't become oversized
// https://reactnavigation.org/docs/native-stack-navigator#headertitle
const HeaderTitle: React.FC<Props> = ({ children }) => {
  const { ColorPallet, TextTheme } = useTheme()
  const styles = StyleSheet.create({
    title: {
      ...TextTheme.title,
      fontSize: 28,
      color: ColorPallet.grayscale.white,
    },
  })
  return (
    <Text adjustsFontSizeToFit style={styles.title}>
      {children}
    </Text>
  )
}

export default HeaderTitle
