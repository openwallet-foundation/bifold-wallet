import React from 'react'
import { TouchableOpacity, StyleSheet, View } from 'react-native'
import { useNavigation } from '@react-navigation/core'

import Icon from 'react-native-vector-icons/MaterialIcons'

import Text from '../texts/Text'

import { textColor, backgroundColor, borderRadius } from '../../globalStyles'
import { parseSchema } from '../../helpers'

interface Props {
  notification: any
}

const NotificationListItem: React.FC<Props> = ({ notification }) => {
  const navigation = useNavigation()

  const { metadata, connectionRecord } = notification

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.navigate('Credential Offer', { notification })}
    >
      <View>
        <Text style={styles.title}>{parseSchema(metadata.schemaId)}</Text>
        <Text>{connectionRecord.alias || connectionRecord.invitation.label}</Text>
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
    paddingVertical: 10,
    paddingLeft: 10,
    borderRadius,
    backgroundColor,
  },
  title: {
    fontWeight: 'bold',
  },
})
