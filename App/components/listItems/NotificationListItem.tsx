import React from 'react'
import { TouchableOpacity, StyleSheet, View } from 'react-native'
import { useNavigation } from '@react-navigation/core'

import Icon from 'react-native-vector-icons/MaterialIcons'

import Text from '../texts/Text'

import { textColor, backgroundColor } from '../../globalStyles'

interface Props {
  notification: any
}

const NotificationListItem: React.FC<Props> = ({ notification }) => {
  const navigation = useNavigation()

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.navigate('Credential Offer', { notification })}
    >
      <View>
        <Text style={styles.title}>{notification.title}</Text>
        <Text>{notification.subtitle}</Text>
      </View>
      <Icon name="chevron-right" color={textColor} size={30} />
    </TouchableOpacity>
  )
}

export default NotificationListItem

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
    padding: 10,
    borderRadius: 5,
    backgroundColor,
  },
  title: {
    fontWeight: 'bold',
  },
})
