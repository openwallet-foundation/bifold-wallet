import { CredentialState, ProofState } from '@aries-framework/core'
import { useCredentialByState, useCredentials, useProofByState } from '@aries-framework/react-hooks'
import { StackNavigationProp } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, StyleSheet, View, Text, Dimensions, TouchableOpacity } from 'react-native'

import { NotificationType } from '../components/listItems/NotificationListItem'
import { ColorPallet, TextTheme } from '../theme'

import { InfoTextBox, NotificationListItem } from 'components'
import { HomeStackParams } from 'types/navigators'

const { width } = Dimensions.get('window')

const offset = 25
const offsetPadding = 5

interface HomeProps {
  navigation: StackNavigationProp<HomeStackParams>
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: offset,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: offset,
  },
  messageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 35,
    marginHorizontal: 60,
  },
  header: {
    marginTop: offset,
    marginBottom: 20,
  },
  linkContainer: {
    minHeight: TextTheme.normal.fontSize,
    marginTop: 10,
  },
  link: {
    ...TextTheme.normal,
    color: ColorPallet.brand.link,
  },
})

const Home: React.FC<HomeProps> = ({ navigation }) => {
  const credentials = [
    ...useCredentialByState(CredentialState.CredentialReceived),
    ...useCredentialByState(CredentialState.Done),
  ]
  const offers = useCredentialByState(CredentialState.OfferReceived)
  const proofs = useProofByState(ProofState.RequestReceived)
  const notifications = [...offers, ...proofs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
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
        <Text style={[TextTheme.normal, { marginTop: offset, textAlign: 'center' }]}>{credentialMsg}</Text>
      </View>
    )
  }

  return (
    <View>
      <View style={styles.rowContainer}>
        <Text style={[TextTheme.headingThree, styles.header]}>
          {t('Home.Notifications')}
          {notifications.length ? ` (${notifications.length})` : ''}
        </Text>
        {notifications.length ? (
          <TouchableOpacity
            style={styles.linkContainer}
            activeOpacity={1}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Text style={styles.link}>{t('Home.SeeAll')}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEnabled={notifications.length > 0 ? true : false}
        snapToOffsets={[
          0,
          ...Array(notifications.length)
            .fill(0)
            .map((n: number, i: number) => i * (width - 2 * (offset - offsetPadding)))
            .slice(1),
        ]}
        decelerationRate="fast"
        ListEmptyComponent={emptyListComponent()}
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View
            style={{
              width: width - 2 * offset,
              marginLeft: !index ? offset : offsetPadding,
              marginRight: index === notifications.length - 1 ? offset : offsetPadding,
            }}
          >
            {item.type === 'CredentialRecord' ? (
              <NotificationListItem notificationType={NotificationType.CredentialOffer} notification={item} />
            ) : (
              <NotificationListItem notificationType={NotificationType.ProofRequest} notification={item} />
            )}
          </View>
        )}
      />
      <View style={styles.container}>{displayMessage(credentials.length)}</View>
    </View>
  )
}

export default Home
