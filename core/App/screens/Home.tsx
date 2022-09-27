import {
  CredentialExchangeRecord as CredentialRecord,
  CredentialState,
  ConnectionRecord,
  DidExchangeState,
} from '@aries-framework/core'
import { useConnectionByState, useCredentialByState } from '@aries-framework/react-hooks'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, StyleSheet, View, Text, Dimensions, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import { NotificationListItem } from '../components'
import ContactListItem from '../components/listItems/ContactListItem'
import { NotificationType } from '../components/listItems/NotificationListItem'
import AvatarView from '../components/misc/AvatarView'
import LoadingModal from '../components/modals/LoadingModal'
import { LocalStorageKeys } from '../constants'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { useNotifications } from '../hooks/notifications'
import { HomeStackParams, Screens, Stacks } from '../types/navigators'
import { Credential as StoreCredentialState } from '../types/state'

const { width } = Dimensions.get('window')
const offset = 25
const offsetPadding = 5

type HomeProps = StackScreenProps<HomeStackParams, Screens.Home>

// export const noContactsMessage = () => {
//   return (
//     <>
//       <Icon name="qrcode-scan" style={{ color: 'white' }} size={32}></Icon>
//       <Text></Text>
//     </>
//   )
// }

const Home: React.FC<HomeProps> = ({ navigation }) => {
  // const connectionRecords = useConnectionByState(DidExchangeState.Completed)
  const connectionRecords = []
  const { notifications } = useNotifications()
  const { t } = useTranslation()
  const { ColorPallet, HomeTheme, ListItems } = useTheme()
  const [store, dispatch] = useStore()
  // This syntax is required for the jest mocks to work
  const [loading, setLoading] = React.useState<boolean>(true)
  const styles = StyleSheet.create({
    // We need a responsive solution to the styling below. -Zack
    container: {
      display: 'flex',
      width: '100%',
      justifyContent: 'center',
    },
    rowContainer: {
      padding: '2%',
      marginHorizontal: '1%',
      width: '98%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    messageContainer: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    linkContainer: {
      minHeight: HomeTheme.link.fontSize,
    },
    user: {
      width: 40,
      height: 40,
      borderWidth: 0,
      backgroundColor: ColorPallet.brand.secondaryBackground,
    },
    wrapper: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    link: {
      ...HomeTheme.link,
      textAlign: 'center',
      paddingTop: 10,
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

  return (
    <>
      {loading ? (
        <LoadingModal />
      ) : (
        <View style={styles.container}>
          <View style={styles.rowContainer}>
            <Text style={[HomeTheme.welcomeHeader]}>{t('Home.Welcome')}</Text>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate(Stacks.SettingStack, { screen: Screens.Settings })
              }}
            >
              <AvatarView name="H" style={styles.user} textStyle={ListItems.homeAvatarText}></AvatarView>
            </TouchableOpacity>
          </View>
          <View style={styles.rowContainer}>
            <Text style={[HomeTheme.notificationsHeader]}>
              {t('Home.Notifications')}
              {` (${notifications.length})`}
            </Text>
          </View>
          <View style={styles.rowContainer}>
            {notifications.length > 0 ? (
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                scrollEnabled={notifications?.length > 0 ? true : false}
                snapToOffsets={[
                  0,
                  ...notifications?.map((_n, i: number) => i * (width - 2 * (offset - offsetPadding))).slice(1),
                ]}
                decelerationRate="fast"
                data={notifications}
                keyExtractor={(item: { id: any }) => item.id}
                renderItem={({ item, index }) => (
                  <View
                    style={{
                      width: width - 2 * offset,
                      marginLeft: index && offsetPadding,
                      marginRight: index === notifications?.length - 1 ? offset : offsetPadding,
                    }}
                  >
                    {item.type === 'CredentialRecord' ? (
                      item.revocationNotification ? (
                        <NotificationListItem notificationType={NotificationType.Revocation} notification={item} />
                      ) : (
                        <NotificationListItem notificationType={NotificationType.CredentialOffer} notification={item} />
                      )
                    ) : (
                      <NotificationListItem notificationType={NotificationType.ProofRequest} notification={item} />
                    )}
                  </View>
                )}
              />
            ) : (
              <View style={[styles.messageContainer]}>
                <Text style={[HomeTheme.noNewUpdatesText]}>{t('Home.NoNewUpdates')}</Text>
              </View>
            )}
          </View>
          <View style={[styles.rowContainer]}>
            <Text style={HomeTheme.notificationsHeader}>
              {t('Home.Contacts')}
              {t(` (${connectionRecords.length})`)}
            </Text>
          </View>
          <View>
            <FlatList
              style={{ backgroundColor: ColorPallet.brand.primaryBackground }}
              data={connectionRecords.slice(0, 3)}
              renderItem={({ item }) => <ContactListItem contact={item} navigation={navigation} />}
              keyExtractor={(item: ConnectionRecord) => item?.did || item.id}
            />
            {/* make connectionRecords an empty array */}
            {connectionRecords.length > 0 && (
              <View style={{ width: '100%', alignItems: 'center' }}>
                <TouchableOpacity
                  style={styles.wrapper}
                  onPress={() => navigation.navigate(Stacks.ContactStack, { screen: Screens.Contacts })}
                >
                  <Text style={styles.link}>{t('Home.ShowAll')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}
    </>
  )
}

export default Home
