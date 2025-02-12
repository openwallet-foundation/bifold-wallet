import { useIsFocused } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, View, StyleSheet } from 'react-native'

import { NotificationType } from '../components/listItems/NotificationListItem'
import AppGuideModal from '../components/modals/AppGuideModal'
import { TOKENS, useServices } from '../container-api'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { useTour } from '../contexts/tour/tour-context'
import { HomeStackParams, Screens } from '../types/navigators'
import { BaseTourID } from '../types/tour'
import { ImportantForAccessibility } from '../types/accessibility'

type HomeProps = StackScreenProps<HomeStackParams, Screens.Home>

const Home: React.FC<HomeProps> = () => {
  const [
    HomeHeaderView,
    NoNewUpdates,
    HomeFooterView,
    { enableTours: enableToursConfig },
    { customNotificationConfig: customNotification, useNotifications },
    NotificationListItem,
  ] = useServices([
    TOKENS.COMPONENT_HOME_HEADER,
    TOKENS.COMPONENT_HOME_NOTIFICATIONS_EMPTY_LIST,
    TOKENS.COMPONENT_HOME_FOOTER,
    TOKENS.CONFIG,
    TOKENS.NOTIFICATIONS,
    TOKENS.NOTIFICATIONS_LIST_ITEM,
  ])
  const notifications = useNotifications({})
  const { t } = useTranslation()
  const { ColorPallet } = useTheme()
  const [store, dispatch] = useStore()
  const { start, stop, currentStep } = useTour()
  const [showTourPopup, setShowTourPopup] = useState(false)
  const [hideElements, setHideElements] = useState<ImportantForAccessibility>('auto')
  const screenIsFocused = useIsFocused()

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
      setHideElements('no-hide-descendants')
      if (store.tours.seenToursPrompt) {
        dispatch({
          type: DispatchAction.UPDATE_SEEN_HOME_TOUR,
          payload: [true],
        })
        start(BaseTourID.HomeTour)
      } else {
        setShowTourPopup(true)
      }
    } else if (currentStep === undefined) {
      setHideElements('auto')
    }
  }, [
    enableToursConfig,
    store.tours.enableTours,
    store.tours.seenHomeTour,
    screenIsFocused,
    store.tours.seenToursPrompt,
    dispatch,
    start,
    currentStep,
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

  return (
    <>
      <FlatList
        style={styles.flatlist}
        importantForAccessibility={hideElements}
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
              backgroundColor: ColorPallet.brand.secondaryBackground,
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
