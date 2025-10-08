import React from 'react'
import { View, StyleSheet } from 'react-native'
import { ThemedText } from '../texts/ThemedText'

interface PINScreenTitleTextProps {
  header: string
  subheader: string
}

const PINScreenTitleText = ({ header, subheader }: PINScreenTitleTextProps) => {
  const style = StyleSheet.create({
    container: {
      paddingTop: 16,
      paddingBottom: 32,
    },
    header: {
      marginBottom: 16,
    },
    subheader: {},
  })

  return (
    <View style={style.container}>
      <ThemedText variant="bold" style={style.header}>
        {header}
      </ThemedText>
      <ThemedText variant="headerTitle" style={style.subheader}>
        {subheader}
      </ThemedText>
    </View>
  )
}

export default PINScreenTitleText
