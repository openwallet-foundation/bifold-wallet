import type { CredentialRecord } from '@aries-framework/core'
import type { StackNavigationProp } from '@react-navigation/stack'

import { useNavigation } from '@react-navigation/core'
import { DateTime } from 'luxon'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View, StyleSheet, TouchableOpacity } from 'react-native'

import { credentialDateTimeFormatString } from '../../constants'
import { ColorPallet } from '../../theme'
import { CredentialStackParams, Screens } from '../../types/navigators'
import { parsedSchema } from '../../utils/helpers'
import AvatarView from '../misc/AvatarView'
import Text from '../texts/Text'
import Title from '../texts/Title'

interface CredentialListItemProps {
  credential: CredentialRecord
}

const styles = StyleSheet.create({
  container: {
    minHeight: 125,
    backgroundColor: ColorPallet.brand.secondaryBackground,
    justifyContent: 'center',
    borderRadius: 15,
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  details: { flexShrink: 1 },
})

const CredentialListItem: React.FC<CredentialListItemProps> = ({ credential }) => {
  const navigation = useNavigation<StackNavigationProp<CredentialStackParams>>()
  const { t } = useTranslation()

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.navigate(Screens.CredentialDetails, { credentialId: credential.id })}
    >
      <View style={styles.row}>
        <AvatarView name={parsedSchema(credential).name} />
        <View style={styles.details}>
          <Title>{parsedSchema(credential).name}</Title>
          <Text>
            {t('CredentialDetails.Version')}: {parsedSchema(credential).version}
          </Text>
          <Text>
            {t('CredentialDetails.Issued')}:{' '}
            {DateTime.fromJSDate(credential.createdAt).toFormat(credentialDateTimeFormatString)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default CredentialListItem
