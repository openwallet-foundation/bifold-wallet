import React from 'react'
import { View, StyleSheet } from 'react-native'

import Text from './Text'

interface Props {
  notification: any
}

const NotificationListItem: React.FC<Props> = ({ notification }) => {
  return (
    <View>
      <Text>boof</Text>
    </View>
  )
}

export default NotificationListItem

const styles = StyleSheet.create({})
