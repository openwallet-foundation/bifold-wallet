import { CredentialExchangeRecord as CredentialRecord } from '@aries-framework/core'
import { useAgent } from '@aries-framework/react-hooks'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, StyleSheet, View, Text, Dimensions, TouchableOpacity } from 'react-native'

import { NotificationListItem } from '../components'
import { NotificationType } from '../components/listItems/NotificationListItem'
import NoNewUpdates from '../components/misc/NoNewUpdates'
import LoadingModal from '../components/modals/LoadingModal'
import { LocalStorageKeys } from '../constants'
import { useConfiguration } from '../contexts/configuration'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { useDeepLinks } from '../hooks/deep-links'
import { useNotifications } from '../hooks/notifications'
import { HomeStackParams, Screens, Stacks } from '../types/navigators'
import { Credential as StoreCredentialState } from '../types/state'
import { connectFromInvitation } from '../utils/helpers'

const { width } = Dimensions.get('window')
const offset = 25
const offsetPadding = 5

type HomeProps = StackScreenProps<HomeStackParams, Screens.Home>

const Home: React.FC<HomeProps> = ({ navigation }) => {
  const { agent } = useAgent()
  const { notifications } = useNotifications()
  const { t } = useTranslation()
  const [store, dispatch] = useStore()
  const { homeContentView: HomeContentView } = useConfiguration()
  // This syntax is required for the jest mocks to work
  // eslint-disable-next-line import/no-named-as-default-member
  const [loading, setLoading] = React.useState<boolean>(true)
  const deepLink = useDeepLinks()
  const { HomeTheme } = useTheme()

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
      minHeight: HomeTheme.link.fontSize,
      marginTop: 10,
    },
    link: {
      ...HomeTheme.link,
    },
  })

  useMemo(() => {
    async function init() {
      try {
        const revokedData = await AsyncStorage.getItem(LocalStorageKeys.RevokedCredentials)
        const revokedMessageDismissedData = await AsyncStorage.getItem(
          LocalStorageKeys.RevokedCredentialsMessageDismissed
        )
        const credentialState: StoreCredentialState = {
          revoked: new Set(),
          revokedMessageDismissed: new Set(),
        }
        if (revokedData) {
          const revoked: Set<CredentialRecord['id']> = new Set(JSON.parse(revokedData) || [])
          credentialState.revoked = revoked
        }
        if (revokedMessageDismissedData) {
          const revokedMessageDismissed: Set<CredentialRecord['id']> = new Set(JSON.parse(revokedMessageDismissedData))
          credentialState.revokedMessageDismissed = revokedMessageDismissed
        }
        dispatch({ type: DispatchAction.CREDENTIALS_UPDATED, payload: [credentialState] })
      } catch (error) {
        // TODO:(am add error handling here)
      }
    }
    init()
  }, [])

  useEffect(() => {
    setLoading(store.loading)
  }, [store.loading])

  useEffect(() => {
    async function handleDeepLink(deepLink: string) {
      try {
        const connectionRecord = await connectFromInvitation(deepLink, agent)
        navigation.getParent()?.navigate(Stacks.ConnectionStack, {
          screen: Screens.Connection,
          params: { connectionId: connectionRecord.id },
        })
      } catch (error) {
        // TODO:(am add error handling here)
      }
    }
    if (agent && deepLink) {
      handleDeepLink(deepLink)
    }
  }, [agent, deepLink])

  return (
    <>
      {loading ? (
        <LoadingModal />
      ) : (
        <View>
          <View style={styles.rowContainer}>
            <Text style={[HomeTheme.notificationsHeader, styles.header]}>
              {t('Home.Notifications')}
              {notifications?.length ? ` (${notifications.length})` : ''}
            </Text>
            {notifications?.length > 1 ? (
              <TouchableOpacity
                style={styles.linkContainer}
                activeOpacity={1}
                onPress={() => navigation.navigate(Screens.Notifications)}
              >
                <Text style={styles.link}>{t('Home.SeeAll')}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEnabled={notifications?.length > 0 ? true : false}
            snapToOffsets={[
              0,
              ...Array(notifications?.length)
                .fill(0)
                .map((n: number, i: number) => i * (width - 2 * (offset - offsetPadding)))
                .slice(1),
            ]}
            decelerationRate="fast"
            ListEmptyComponent={() => (
              <View style={{ marginHorizontal: offset, width: width - 2 * offset }}>
                <NoNewUpdates />
                <View style={[styles.messageContainer]}>
                  <Text style={[HomeTheme.welcomeHeader, { marginTop: offset, marginBottom: 20 }]}>
                    {t('Home.Welcome')}
                  </Text>
                </View>
              </View>
            )}
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <View
                style={{
                  width: width - 2 * offset,
                  marginLeft: !index ? offset : offsetPadding,
                  marginRight: index === notifications?.length - 1 ? offset : offsetPadding,
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
          <HomeContentView />
        </View>
      )}
    </>
  )
}

export default Home
