import { CredentialState, ProofState } from '@aries-framework/core'
import { useCredentialByState, useProofByState } from '@aries-framework/react-hooks'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, StyleSheet, View, Text, Linking, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import ExternalLink from '../assets/img/external-link.svg'
import { borderRadius, borderWidth, ColorPallet, Colors, TextTheme } from '../theme'

import { InfoTextBox, NotificationCredentialListItem, NotificationProofListItem } from 'components'

const iconDisplayOptions = {
  fill: Colors.text,
  height: 18,
  width: 18,
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: ColorPallet.brand.primaryBackground,
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

const emptyListComponent = (
  <View>
    <InfoTextBox>You have no new notifications</InfoTextBox>
    <View style={[styles.messageContainer]}>
      <Text style={[TextTheme.headingOne]}>Welcome</Text>
      <Text style={[TextTheme.normal, { marginTop: 25, textAlign: 'center' }]}>
        You have no credentials in your wallet.
      </Text>
    </View>
    <TouchableOpacity style={[styles.link, { marginTop: 25 }]} onPress={() => Linking.openURL('https://example.com/')}>
      <Icon name={'credit-card'} size={32} color={ColorPallet.brand.primary} />
      <Text style={[styles.linkText]}>Find a Credential</Text>
      <ExternalLink {...iconDisplayOptions} />
    </TouchableOpacity>
    <TouchableOpacity style={[styles.link, { marginTop: 15 }]} onPress={() => Linking.openURL('https://example.com/')}>
      <Icon name={'info'} size={32} color={ColorPallet.brand.primary} />
      <Text style={[styles.linkText]}>Learn about Credentials</Text>
      <ExternalLink {...iconDisplayOptions} />
    </TouchableOpacity>
  </View>
)

const Home: React.FC = () => {
  const credentials = useCredentialByState(CredentialState.OfferReceived)
  const proofs = useProofByState(ProofState.RequestReceived)
  const data = [...credentials, ...proofs]
  const { t } = useTranslation()

  // State
  // 1. No notifications, empty wallet.
  // 2. Notifications, empty wallet.
  // 3. No notifications, 1 or more credentials.

  return (
    <View style={styles.container}>
      <Text style={[TextTheme.headingThree, styles.header]}>Notifications</Text>
      <FlatList
        scrollEnabled={data.length > 0 ? true : false}
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) =>
          item.type === 'CredentialRecord' ? (
            <NotificationCredentialListItem notification={item} />
          ) : (
            <NotificationProofListItem notification={item} />
          )
        }
        ListEmptyComponent={emptyListComponent}
      />
    </View>
  )
}

export default Home
