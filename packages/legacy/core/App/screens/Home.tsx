import { useIsFocused } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, StyleSheet, View, Text, Dimensions, TouchableOpacity } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

import NotificationListItem, { NotificationType } from '../components/listItems/NotificationListItem'
import NoNewUpdates from '../components/misc/NoNewUpdates'
import AppGuideModal from '../components/modals/AppGuideModal'
import { AttachTourStep } from '../components/tour/AttachTourStep'
import { useConfiguration } from '../contexts/configuration'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { useTour } from '../contexts/tour/tour-context'
import { HomeStackParams, Screens } from '../types/navigators'

const { width } = Dimensions.get('window')
const offset = 25
const offsetPadding = 5

type HomeProps = StackScreenProps<HomeStackParams, Screens.Home>

const Home: React.FC<HomeProps> = ({ navigation }) => {
  const { useCustomNotifications, enableTours: enableToursConfig } = useConfiguration()
  const { notifications } = useCustomNotifications()
  const { t } = useTranslation()
  const { homeContentView: HomeContentView } = useConfiguration()

  // This syntax is required for the jest mocks to work
  // eslint-disable-next-line import/no-named-as-default-member
  const { HomeTheme } = useTheme()
  const [store, dispatch] = useStore()
  const { start, stop } = useTour()
  const [showTourPopup, setShowTourPopup] = useState(false)
  const screenIsFocused = useIsFocused()

  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: offset,
    },
    rowContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      paddingHorizontal: offset,
    },
    messageContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 35,
      marginHorizontal: offset,
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

  const DisplayListItemType = (item: any): Element => {
    let component: Element
    if (item.type === 'CredentialRecord') {
      let notificationType = NotificationType.CredentialOffer
      if (item.revocationNotification) {
        notificationType = NotificationType.Revocation
      }
      component = <NotificationListItem notificationType={notificationType} notification={item} />
    } else if (item.type === 'CustomNotification') {
      component = <NotificationListItem notificationType={NotificationType.Custom} notification={item} />
    } else {
      component = <NotificationListItem notificationType={NotificationType.ProofRequest} notification={item} />
    }
    return component
  }

  useEffect(() => {
    const shouldShowTour =
      store.preferences.developerModeEnabled &&
      enableToursConfig &&
      store.tours.enableTours &&
      !store.tours.seenHomeTour

    if (shouldShowTour && screenIsFocused) {
      if (store.tours.seenToursPrompt) {
        dispatch({
          type: DispatchAction.UPDATE_SEEN_HOME_TOUR,
          payload: [true],
        })
        start()
      } else {
        dispatch({
          type: DispatchAction.UPDATE_SEEN_TOUR_PROMPT,
          payload: [true],
        })
        setShowTourPopup(true)
      }
    }

    return stop
  }, [screenIsFocused])

  const onCTAPressed = () => {
    setShowTourPopup(false)
    dispatch({
      type: DispatchAction.ENABLE_TOURS,
      payload: [true],
    })
    dispatch({
      type: DispatchAction.UPDATE_SEEN_HOME_TOUR,
      payload: [true],
    })
    start()
  }

  const onDismissPressed = () => {
    setShowTourPopup(false)
    dispatch({
      type: DispatchAction.ENABLE_TOURS,
      payload: [false],
    })
  }

  return (
    <ScrollView>
      {showTourPopup && (
        <AppGuideModal
          title={t('Tour.GuideTitle')}
          description={t('Tour.WouldYouLike')}
          onCallToActionPressed={onCTAPressed}
          onCallToActionLabel={t('Tour.UseAppGuides')}
          onSecondCallToActionPressed={onDismissPressed}
          onSecondCallToActionLabel={t('Tour.DoNotUseAppGuides')}
          onDismissPressed={onDismissPressed}
        />
      )}
      <View style={styles.rowContainer}>
        <View>
          {notifications?.length > 0 ? (
            <AttachTourStep index={1} fill>
              <Text style={[HomeTheme.notificationsHeader, styles.header]}>
                {t('Home.Notifications')}
                {notifications?.length ? ` (${notifications.length})` : ''}
              </Text>
            </AttachTourStep>
          ) : (
            <Text style={[HomeTheme.notificationsHeader, styles.header]}>
              {t('Home.Notifications')}
              {notifications?.length ? ` (${notifications.length})` : ''}
            </Text>
          )}
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
            <AttachTourStep index={1} fill>
              <View>
                <NoNewUpdates />
              </View>
            </AttachTourStep>
          </View>
        )}
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View
            accessible={true}
            style={{
              width: width - 2 * offset,
              marginLeft: !index ? offset : offsetPadding,
              marginRight: index === notifications?.length - 1 ? offset : offsetPadding,
            }}
          >
            {DisplayListItemType(item)}
          </View>
        )}
      />
      <HomeContentView />
    </ScrollView>
  )
}

export default Home
