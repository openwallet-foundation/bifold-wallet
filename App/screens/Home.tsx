import { CredentialState, ProofState } from '@aries-framework/core'
import { useCredentialByState, useCredentials, useProofByState } from '@aries-framework/react-hooks'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, StyleSheet, View, Text, Dimensions } from 'react-native'

import { NotificationType } from '../components/listItems/NotificationListItem'
import { borderRadius, borderWidth, ColorPallet, TextTheme } from '../theme'

import { InfoTextBox, NotificationListItem } from 'components'

const { width } = Dimensions.get('window')

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 25,
  },
  messageContainer: {
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

const Home: React.FC = () => {
  const { credentials } = useCredentials()
  const offers = useCredentialByState(CredentialState.OfferReceived)
  const proofs = useProofByState(ProofState.RequestReceived)
  const data = [...offers, ...proofs]
  const { t } = useTranslation()

  const emptyListComponent = () => (
    <View style={styles.container}>
      <InfoTextBox>{t('Home.NoNewUpdates')}</InfoTextBox>
    </View>
  )

  const displayMessage = (credentialCount: number) => {
    if (typeof credentialCount === 'undefined' && credentialCount >= 0) {
      throw new Error('Credential count cannot be undefined')
    }

    let credentialMsg

    if (credentialCount === 1) {
      credentialMsg = t('Home.OneCredential')
    } else if (credentialCount > 1) {
      credentialMsg = t('Home.ManyCredentials').replace('$_', `${credentialCount}`)
    } else {
      credentialMsg = t('Home.NoCredentials')
    }

    return (
      <View style={[styles.messageContainer]}>
        {credentialCount === 0 ? <Text style={[TextTheme.headingOne]}>{t('Home.Welcome')}</Text> : null}
        <Text style={[TextTheme.normal, { marginTop: 25, textAlign: 'center' }]}>{credentialMsg}</Text>
      </View>
    )
  }

  return (
    <View>
      <View style={styles.container}>
        <Text style={[TextTheme.headingThree, styles.header]}>
          {t('Home.Notifications')}
          {data.length ? ` (${data.length})` : ''}
        </Text>
      </View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEnabled={data.length > 0 ? true : false}
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={{ paddingLeft: !index ? 25 : 5, paddingRight: index === data.length - 1 ? 25 : 5 }}>
            {item.type === 'CredentialRecord' ? (
              <NotificationListItem notificationType={NotificationType.CredentialOffer} notification={item} />
            ) : (
              <NotificationListItem notificationType={NotificationType.ProofRequest} notification={item} />
            )}
          </View>
        )}
        ListEmptyComponent={emptyListComponent()}
        snapToOffsets={[
          0,
          ...Array(data.length)
            .fill(0)
            .map((n: number, i: number) => i * (width - 40))
            .slice(1),
        ]}
        decelerationRate="fast"
      />
      <View style={styles.container}>
        {displayMessage(credentials.length)}
        {/* <View style={[{ marginTop: 35 }]}>
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
      </View> */}
      </View>
    </View>
  )
}

export default Home
