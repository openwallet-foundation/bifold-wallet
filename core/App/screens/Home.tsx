import {
  CredentialExchangeRecord as CredentialRecord,
  ConnectionType,
  ConnectionRecord,
  DidExchangeState,
} from '@aries-framework/core'
import { useConnections } from '@aries-framework/react-hooks'
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
import { HomeStackParams, Screens, TabStacks } from '../types/navigators'
import { Credential as StoreCredentialState } from '../types/state'

const { width } = Dimensions.get('window')
const offset = 25
const offsetPadding = 5

type HomeProps = StackScreenProps<HomeStackParams, Screens.Home>

export const NoContactsMessage = () => {
  const { t } = useTranslation()
  const { ColorPallet, TextTheme } = useTheme()
  const noContactStyles = StyleSheet.create({
    container: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      width: '45%',
      alignItems: 'center',
    },
    icon: {
      color: ColorPallet.brand.secondaryBackground,
    },
    text: {
      ...TextTheme.normal,
      textAlign: 'center',
      color: ColorPallet.brand.secondaryBackground,
      paddingVertical: 15,
    },
  })

  return (
    <>
      <View style={noContactStyles.container}>
        <View style={noContactStyles.content}>
          <Icon name={'qrcode-scan'} style={noContactStyles.icon} size={65}></Icon>
          <Text style={noContactStyles.text}>
            {t('Home.Touch')} <Text style={{ fontWeight: 'bold' }}>{t('Home.Scan')}</Text> {t('Home.BelowToCreate')}
          </Text>
          <Icon name={'arrow-down-thick'} style={noContactStyles.icon} size={40}></Icon>
        </View>
      </View>
    </>
  )
}

const Home: React.FC<HomeProps> = ({ navigation }) => {
  const { records: connectionRecords } = useConnections({
    excludedTypes: [ConnectionType.Mediator],
    connectionState: DidExchangeState.Completed,
  })
  const { notifications } = useNotifications()
  const { t } = useTranslation()
  const { ColorPallet, HomeTheme, ListItems } = useTheme()
  const [store, dispatch] = useStore()
  // This syntax is required for the jest mocks to work
  const [loading, setLoading] = React.useState<boolean>(true)
  const styles = StyleSheet.create({
    // We need a responsive solution to the styling below. -Zack
    container: {
      width: '100%',
      flex: 1,
    },
    rowContainer: {
      padding: '2%',
      margin: '1%',
      width: '98%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    messageContainer: {
      width: '100%',
      alignItems: 'center',
    },
    contactContainer: {
      flex: 1,
      alignContent: 'center',
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
            <Text style={[HomeTheme.welcomeHeader]}>
              {t('Home.Welcome')} {store.user.firstName}
            </Text>
            <TouchableOpacity
              onPress={() => {
                //Resolve TabStacks vs Stacks
                navigation.navigate(TabStacks.SettingStack, { screen: Screens.Settings })
              }}
            >
              <AvatarView
                name={store.user.firstName.charAt(0)}
                style={{ ...styles.user, margin: 0 }}
                textStyle={ListItems.homeAvatarText}
              ></AvatarView>
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
          <View style={styles.rowContainer}>
            <Text style={HomeTheme.notificationsHeader}>
              {t('Home.Contacts')}
              {` (${connectionRecords.length})`}
            </Text>
          </View>
          <View style={styles.contactContainer}>
            {connectionRecords.length > 0 ? (
              <View style={{ width: '100%', height: '100%' }}>
                <View>
                  <FlatList
                    style={{ backgroundColor: ColorPallet.brand.primaryBackground }}
                    data={connectionRecords.slice(0, 3)}
                    renderItem={({ item }) => <ContactListItem contact={item} navigation={navigation} />}
                    keyExtractor={(item: ConnectionRecord) => item?.did || item.id}
                  />
                </View>
                <View style={{ width: '100%', alignItems: 'center' }}>
                  <TouchableOpacity
                    style={styles.wrapper}
                    onPress={() => navigation.navigate(TabStacks.ContactStack, { screen: Screens.Contacts })}
                  >
                    <Text style={styles.link}>{t('Home.ShowAll')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <NoContactsMessage />
            )}
          </View>
        </View>
      )}
    </>
  )
}

export default Home
