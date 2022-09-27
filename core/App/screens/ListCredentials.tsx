import { CredentialExchangeRecord as CredentialRecord, CredentialState } from '@aries-framework/core'
import { useCredentialByState, useCredentials } from '@aries-framework/react-hooks'
import { useNavigation } from '@react-navigation/core'
import { StackNavigationProp } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, View } from 'react-native'

import CredentialCard from '../components/misc/CredentialCard'
import EmptyList from '../components/misc/EmptyList'
import { useTheme } from '../contexts/theme'
import { CredentialStackParams, Screens } from '../types/navigators'

const ListCredentials: React.FC = () => {
  const { t } = useTranslation()
  const credentials = [
    ...useCredentialByState(CredentialState.CredentialReceived),
    ...useCredentialByState(CredentialState.Done),
  ]
  const { ColorPallet } = useTheme()
  const navigation = useNavigation<StackNavigationProp<CredentialStackParams>>()

  return (
    <>
      {credentials.length > 0 ? (
        <FlatList
          style={{ backgroundColor: ColorPallet.brand.primaryBackground }}
          data={credentials.sort((a, b) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf())}
          keyExtractor={(item: CredentialRecord) => item.id}
          renderItem={({ item, index }) => (
            <View
              style={{
                marginHorizontal: 15,
                marginTop: 15,
                marginBottom: index === credentials.length - 1 ? 45 : 0,
              }}
            >
              <CredentialCard
                credential={item}
                revoked={item.revocationNotification !== undefined}
                onPress={() => navigation.navigate(Screens.CredentialDetails, { credentialId: item.id })}
              />
            </View>
          )}
        />
      ) : (
        <View style={{ height: '100%', justifyContent: 'center' }}>
          <EmptyList message={t('Credentials.EmptyList')} />
        </View>
      )}
    </>
  )
}

export default ListCredentials
