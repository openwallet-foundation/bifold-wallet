import React from 'react'
import { FlatList } from 'react-native'
import { CredentialState, ProofState } from '@aries-framework/core'
import { useTranslation } from 'react-i18next'

import { useCredentialByState, useProofByState } from 'aries-hooks'

import {
  Button,
  SafeAreaScrollView,
  AppHeaderLarge,
  ModularView,
  NotificationCredentialListItem,
  NotificationProofListItem,
  Text,
} from 'components'

interface Props {
  navigation: any
}

const Home: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation()
  
  const credentials = useCredentialByState(CredentialState.OfferReceived)
  const proofs = useProofByState(ProofState.RequestReceived)

  return (
    <SafeAreaScrollView>
      <AppHeaderLarge />
      <Button title={t('Home.scanner')} onPress={() => navigation.jumpTo('Scan')} />
      <ModularView
        title={t('Home.notifications')}
        content={
          <FlatList
            data={[...credentials, ...proofs]}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) =>
              item.type === 'CredentialRecord' ? (
                <NotificationCredentialListItem notification={item} />
              ) : (
                <NotificationProofListItem notification={item} />
              )
            }
            ListEmptyComponent={<Text>{t('Home.noNewUpdates')}</Text>}
          />
        }
      />
    </SafeAreaScrollView>
  )
}

export default Home
