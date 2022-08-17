import { CredentialState } from '@aries-framework/core'
import { useCredentialByState } from '@aries-framework/react-hooks'
import { useNavigation } from '@react-navigation/core'
import { StackNavigationProp } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, View } from 'react-native'

import branding from '../assets/img/credential-branding/credential-branding'
import CredentialCard from '../components/misc/CredentialCard'
import EmptyList from '../components/misc/EmptyList'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { CredentialStackParams, Screens } from '../types/navigators'
import { credentialSchema } from '../utils/schema'

const ListCredentials: React.FC = () => {
  const { t } = useTranslation()
  const credentials = [
    ...useCredentialByState(CredentialState.CredentialReceived),
    ...useCredentialByState(CredentialState.Done),
  ]
  const [state] = useStore()
  const { revoked } = state.credential
  const navigation = useNavigation<StackNavigationProp<CredentialStackParams>>()
  const { ColorPallet } = useTheme()

  return (
    <FlatList
      style={{ backgroundColor: ColorPallet.brand.primaryBackground }}
      data={credentials.sort((a, b) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf())}
      keyExtractor={(credential) => credential.id}
      renderItem={({ item: credential, index }) => {
        const schema = credentialSchema(credential) || ''
        return (
          <View
            style={{
              marginHorizontal: 15,
              marginTop: 15,
              marginBottom: index === credentials.length - 1 ? 45 : 0,
            }}
          >
            <CredentialCard
              credential={credential}
              revoked={revoked.has(credential.id)}
              onPress={() => navigation.navigate(Screens.CredentialDetails, { credentialId: credential.id })}
              overlay={branding[schema] ?? undefined}
            />
          </View>
        )
      }}
      ListEmptyComponent={() => <EmptyList message={t('Credentials.EmptyList')} />}
    />
  )
}

export default ListCredentials
