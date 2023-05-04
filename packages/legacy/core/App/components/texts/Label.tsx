import React from 'react'
import { View, StyleSheet } from 'react-native'

import { useTheme } from '../../contexts/theme'

import Text from './Text'

interface Props {
  title: string
  subtitle?: string
  label?: string
}

const Label: React.FC<Props> = ({ title, subtitle, label }) => {
  const { TextTheme } = useTheme()
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '90%',
      marginTop: 10,
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    title: {
      ...TextTheme.labelTitle,
      marginRight: 7,
    },
    subtitle: {
      ...TextTheme.labelSubtitle,
    },
    label: {
      marginLeft: 10,
      ...TextTheme.labelText,
    },
  })
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}:</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  )
}

export default Label
