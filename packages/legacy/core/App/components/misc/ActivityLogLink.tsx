import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { testIdWithKey } from '../../utils/testable'

const ActivityLogLink: React.FC = () => {
  const { ColorPallet } = useTheme()
  const styles = StyleSheet.create({
    textContainer: {
      flexDirection: 'row',
    },
    text: {
      color: ColorPallet.notification.infoText,
    },
    link: {
      color: ColorPallet.notification.infoText,
      textDecorationLine: 'underline',
    },
  })
  return (
    <View style={styles.textContainer} testID={testIdWithKey('ActivityLogLink')}>
      <Text style={styles.text}>Your</Text>
      <Text> </Text>
      <Text style={styles.link}>activity log</Text>
      <Text> </Text>
      <Text style={styles.text}>has been updated</Text>
    </View>
  )
}

export default ActivityLogLink
