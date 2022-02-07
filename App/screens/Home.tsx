import { CredentialState, ProofState } from '@aries-framework/core'
import { useCredentialByState, useCredentials, useProofByState } from '@aries-framework/react-hooks'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, StyleSheet, View, Text, Linking, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import ExternalLink from '../assets/img/external-link.svg'
import { borderRadius, borderWidth, ColorPallet, Colors, TextTheme } from '../theme'

import { InfoTextBox, NotificationListItem } from 'components'
import { NotificationType } from 'components/listItems/NotificationListItem'

const iconDisplayOptions = {
  fill: Colors.text,
  height: 18,
  width: 18,
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 25,
  },
  messageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 35,
    marginHorizontal: 60,
  },
  header: {
    marginTop: 25,
    marginBottom: 20,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: ColorPallet.brand.primary,
    borderWidth: borderWidth,
    borderRadius: borderRadius,
    paddingLeft: 20,
    minHeight: 48,
  },
  linkText: {
    ...TextTheme.normal,
    fontWeight: 'bold',
    marginHorizontal: 15,
  },
})

const emptyListComponent = (credentialCount: number) => {
  const pluralOrNot = credentialCount === 1 ? '' : 's'
  const credentialMsg = `You have ${
    credentialCount === 0 ? 'no' : credentialCount
  } credential${pluralOrNot} in your wallet.`

  return (
    <View>
      <InfoTextBox>You have no new notifications</InfoTextBox>
      <View style={[styles.messageContainer]}>
        {credentialCount === 0 ? <Text style={[TextTheme.headingOne]}>Welcome</Text> : null}
        <Text style={[TextTheme.normal, { marginTop: 25, textAlign: 'center' }]}>{credentialMsg}</Text>
      </View>
    </View>
  )
}

const Home: React.FC = () => {
  const { credentials } = useCredentials()
  const offers = useCredentialByState(CredentialState.OfferReceived)
  const proofs = useProofByState(ProofState.RequestReceived)
  // const data = [
  //   { id: 1, c: 'red', type: 'CredentialRecord' },
  //   { id: 2, c: 'green', type: 'CredentialRecord' },
  // ]
  const data = [...offers, ...proofs]
  const { t } = useTranslation()

  // State
  // 1. No notifications, empty wallet.
  // 2. Notifications, empty wallet.
  // 3. No notifications, 1 or more credentials.

  return (
    <View style={styles.container}>
      <Text style={[TextTheme.headingThree, styles.header]}>Notifications</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEnabled={data.length > 0 ? true : false}
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) =>
          item.type === 'CredentialRecord' ? (
            <NotificationListItem notificationType={NotificationType.CredentialOffer} notification={item} />
          ) : (
            <NotificationListItem notification={item} />
          )
        }
        ListEmptyComponent={emptyListComponent(credentials.length)}
      />
      <View style={[{ marginTop: 25 }]}>
        <TouchableOpacity style={[styles.link]} onPress={() => Linking.openURL('https://example.com/')}>
          <Icon name={'credit-card'} size={32} color={ColorPallet.brand.primary} />
          <Text style={[styles.linkText]}>Find a Credential</Text>
          <ExternalLink {...iconDisplayOptions} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.link, { marginTop: 15 }]}
          onPress={() => Linking.openURL('https://example.com/')}
        >
          <Icon name={'info'} size={32} color={ColorPallet.brand.primary} />
          <Text style={[styles.linkText]}>Learn about Credentials</Text>
          <ExternalLink {...iconDisplayOptions} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default Home
