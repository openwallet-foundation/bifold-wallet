import { useIsFocused } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, View, StyleSheet, DeviceEventEmitter } from 'react-native'

import { NotificationType } from '../components/listItems/NotificationListItem'
import AppGuideModal from '../components/modals/AppGuideModal'
import { TOKENS, useServices } from '../container-api'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { useTour } from '../contexts/tour/tour-context'
import { HomeStackParams, Screens } from '../types/navigators'
import { BaseTourID } from '../types/tour'
import { OpenIDCustomNotificationType } from '../modules/openid/refresh/types'
import { EventTypes } from '../constants'
import Toast from 'react-native-toast-message'
import { ToastType } from '../components/toast/BaseToast'

type HomeProps = StackScreenProps<HomeStackParams, Screens.Home>

const Home: React.FC<HomeProps> = () => {
  const [
    HomeHeaderView,
    NoNewUpdates,
    HomeFooterView,
    { enableTours: enableToursConfig },
    { customNotificationConfig: customNotification, useNotifications },
    NotificationListItem,
    orchestrator,
  ] = useServices([
    TOKENS.COMPONENT_HOME_HEADER,
    TOKENS.COMPONENT_HOME_NOTIFICATIONS_EMPTY_LIST,
    TOKENS.COMPONENT_HOME_FOOTER,
    TOKENS.CONFIG,
    TOKENS.NOTIFICATIONS,
    TOKENS.NOTIFICATIONS_LIST_ITEM,
    TOKENS.UTIL_REFRESH_ORCHESTRATOR,
  ])
  const notifications = useNotifications({})
  const { t } = useTranslation()
  const { ColorPalette } = useTheme()
  const [store, dispatch] = useStore()
  const { start, stop } = useTour()
  const [showTourPopup, setShowTourPopup] = useState(false)
  const screenIsFocused = useIsFocused()
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null)

  const styles = StyleSheet.create({
    flatlist: {
      marginBottom: 35,
    },
  })

  const DisplayListItemType = useCallback(
    (item: any): React.ReactNode => {
      let component: React.ReactNode
      if (item.type === 'BasicMessageRecord') {
        component = <NotificationListItem notificationType={NotificationType.BasicMessage} notification={item} />
      } else if (item.type === 'CredentialRecord') {
        let notificationType = NotificationType.CredentialOffer
        if (item.revocationNotification) {
          notificationType = NotificationType.Revocation
        }
        component = <NotificationListItem notificationType={notificationType} notification={item} />
      } else if (item.type === 'CustomNotification' && customNotification) {
        component = (
          <NotificationListItem
            notificationType={NotificationType.Custom}
            notification={item}
            customNotification={customNotification}
          />
        )
      } else if (item.type === OpenIDCustomNotificationType.CredentialExpired) {
        component = (
          <NotificationListItem
            notificationType={NotificationType.Custom}
            notification={item}
            customNotification={item}
          />
        )
      } else {
        component = <NotificationListItem notificationType={NotificationType.ProofRequest} notification={item} />
      }
      return component
    },
    [customNotification, NotificationListItem]
  )

  useEffect(() => {
    const shouldShowTour = enableToursConfig && store.tours.enableTours && !store.tours.seenHomeTour
    if (shouldShowTour && screenIsFocused) {
      if (store.tours.seenToursPrompt) {
        dispatch({
          type: DispatchAction.UPDATE_SEEN_HOME_TOUR,
          payload: [true],
        })
        start(BaseTourID.HomeTour)
      } else {
        setShowTourPopup(true)
      }
    }
  }, [
    enableToursConfig,
    store.tours.enableTours,
    store.tours.seenHomeTour,
    screenIsFocused,
    store.tours.seenToursPrompt,
    dispatch,
    start,
  ])

  const onCTAPressed = useCallback(() => {
    setShowTourPopup(false)
    dispatch({
      type: DispatchAction.UPDATE_SEEN_HOME_TOUR,
      payload: [true],
    })
    dispatch({
      type: DispatchAction.ENABLE_TOURS,
      payload: [true],
    })
    dispatch({
      type: DispatchAction.UPDATE_SEEN_TOUR_PROMPT,
      payload: [true],
    })
    start(BaseTourID.HomeTour)
  }, [dispatch, start])

  const onDismissPressed = useCallback(() => {
    setShowTourPopup(false)
    dispatch({
      type: DispatchAction.ENABLE_TOURS,
      payload: [false],
    })
    dispatch({
      type: DispatchAction.UPDATE_SEEN_TOUR_PROMPT,
      payload: [true],
    })
  }, [dispatch])

  // stop the tour when the screen unmounts
  useEffect(() => {
    return stop
  }, [stop])

  //Run OpenID refresh when requested via DeviceEventEmitter
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(EventTypes.OPENID_REFRESH_REQUEST, () => {
      // Optional: only refresh when Home is actually visible
      if (!screenIsFocused) return

      // Clear any pending timer to avoid stacking
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)

      Toast.show({
        type: ToastType.Info,
        text1: t('Toast.OpenIDCredRefreshing.Title'),
        text2: t('Toast.OpenIDCredRefreshing.Message'),
        visibilityTime: 4000,
        position: 'bottom',
      })

      // Run once after 4 seconds
      refreshTimerRef.current = setTimeout(() => {
        orchestrator.runOnce('developer-menu')
      }, 4000)
    })

    return () => {
      sub.remove()
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
    }
  }, [screenIsFocused, orchestrator, t])

  return (
    <>
      <FlatList
        style={styles.flatlist}
        showsVerticalScrollIndicator={false}
        scrollEnabled={notifications?.length > 0 ? true : false}
        decelerationRate="fast"
        ListEmptyComponent={NoNewUpdates}
        ListHeaderComponent={() => <HomeHeaderView />}
        ListFooterComponent={() => <HomeFooterView />}
        data={notifications}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <View
            style={{
              paddingHorizontal: 20,
              paddingTop: index === 0 ? 20 : 0,
              paddingBottom: index === notifications.length - 1 ? 20 : 10,
              backgroundColor: ColorPalette.brand.secondaryBackground,
            }}
          >
            {DisplayListItemType(item)}
          </View>
        )}
      />
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
    </>
  )
}

export default Home
