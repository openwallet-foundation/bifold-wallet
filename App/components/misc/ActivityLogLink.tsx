import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

import { Colors } from '../../theme'

const styles = StyleSheet.create({
  textContainer: {
    flexDirection: 'row',
  },
  text: {
    color: Colors.text,
  },
  link: {
    color: Colors.text,
    textDecorationLine: 'underline',
  },
})

const ActivityLogLink: React.FC = () => {
  return (
    <View style={styles.textContainer}>
      <Text style={styles.text}>Your</Text>
      <Text> </Text>
      <Text style={styles.link}>activity log</Text>
      <Text> </Text>
      <Text style={styles.text}>has been updated</Text>
    </View>
  )
}

export default ActivityLogLink
