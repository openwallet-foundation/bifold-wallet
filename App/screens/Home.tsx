import { CredentialState, ProofState } from '@aries-framework/core'
import { useCredentialByState, useProofByState } from '@aries-framework/react-hooks'
import {
  AppHeaderLarge,
  ModularView,
  NotificationCredentialListItem,
  NotificationProofListItem,
  Text,
} from 'components'
import { LocalizationContext } from 'LocalizationProvider'
import React, { useContext } from 'react'
import { FlatList, StyleSheet, View } from 'react-native'
import { backgroundColor } from '../globalStyles'

const styles = StyleSheet.create({
  container: {
    backgroundColor,
    height: '100%',
  },
})

const Home: React.FC = () => {
  const credentials = useCredentialByState(CredentialState.OfferReceived)
  const proofs = useProofByState(ProofState.RequestReceived)
  const { translations } = useContext(LocalizationContext)

  return (
    <View style={styles.container}>
      <AppHeaderLarge />
      <ModularView
        title={translations.ScreenNames.Notifications}
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
            ListEmptyComponent={<Text>{translations.NoUpdates}</Text>}
          />
        }
      />
    </View>
  )
}

export default Home
