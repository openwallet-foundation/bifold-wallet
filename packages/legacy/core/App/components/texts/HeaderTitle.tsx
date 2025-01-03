import React from 'react'
import { Text, StyleSheet } from 'react-native'

import { useTheme } from '../../contexts/theme'

interface Props {
  children: React.ReactNode
}

// this component is used to create a custom header title that doesn't become oversized
// https://reactnavigation.org/docs/native-stack-navigator#headertitle
const HeaderTitle: React.FC<Props> = ({ children }) => {
  const { TextTheme } = useTheme()
  const styles = StyleSheet.create({
    title: {
      ...TextTheme.headerTitle,
      textAlign: 'center',
    },
  })

  return (
    <Text accessibilityRole="header" numberOfLines={1} ellipsizeMode="tail" style={styles.title}>
      {children}
    </Text>
  )
}

export default HeaderTitle
