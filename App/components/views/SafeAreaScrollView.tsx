import React from 'react'
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native'

import { Colors } from '../../Theme'

interface Props {
  children: React.ReactNode
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundColor,
  },
  scrollView: {
    alignItems: 'center',
  },
})

const SafeAreaScrollView: React.FC<Props> = ({ children }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>{children}</ScrollView>
    </SafeAreaView>
  )
}

export default SafeAreaScrollView
