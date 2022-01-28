import type { CredentialRecord } from '@aries-framework/core'

import { useNavigation } from '@react-navigation/core'
import { StackNavigationProp } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { TouchableOpacity, StyleSheet, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { Colors, borderRadius, TextTheme, CredentialOfferTheme } from '../../theme'
import { parsedSchema } from '../../utils/helpers'
import Text from '../texts/Text'
import Title from '../texts/Title'

import { HomeStackParams } from 'types/navigators'

interface Props {
  notification: CredentialRecord
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
    paddingVertical: 10,
    paddingLeft: 10,
    borderRadius,
    backgroundColor: CredentialOfferTheme.background,
  },
})

const NotificationCredentialListItem: React.FC<Props> = ({ notification }) => {
  const navigation = useNavigation<StackNavigationProp<HomeStackParams>>()
  const { t } = useTranslation()

  // TODO: Reincorporate according to UI wireframes
  // const connection = connectionRecordFromId(notification.connectionId)

  const { name: schemaName, version: schemaVersion } = parsedSchema(notification)

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.navigate('Credential Offer', { credentialId: notification.id })}
    >
      <View>
        <Title>{t('CredentialOffer.CredentialOffer')}</Title>
        <Text style={TextTheme.normal}>{schemaName + (schemaVersion ? ` V${schemaVersion}` : '')}</Text>
        {/* {!!connection && <Text style={TextTheme.normal}>{connection?.alias || connection?.invitation?.label}</Text>} */}
      </View>
      <Icon name="chevron-right" color={Colors.text} size={30} />
    </TouchableOpacity>
  )
}

export default NotificationCredentialListItem
