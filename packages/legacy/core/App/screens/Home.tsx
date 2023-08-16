import { useIsFocused } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, View } from 'react-native'

import NotificationListItem, { NotificationType } from '../components/listItems/NotificationListItem'
import NoNewUpdates from '../components/misc/NoNewUpdates'
import AppGuideModal from '../components/modals/AppGuideModal'
import { useConfiguration } from '../contexts/configuration'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTour } from '../contexts/tour/tour-context'
import { HomeStackParams, Screens } from '../types/navigators'
import { TourID } from '../types/tour'

type HomeProps = StackScreenProps<HomeStackParams, Screens.Home>

const Home: React.FC<HomeProps> = () => {
  const { useCustomNotifications, enableTours: enableToursConfig } = useConfiguration()
  const { notifications } = useCustomNotifications()
  const { t } = useTranslation()
  const { homeFooterView: HomeFooterView, homeHeaderView: HomeHeaderView } = useConfiguration()

  // This syntax is required for the jest mocks to work
  // eslint-disable-next-line import/no-named-as-default-member
  // const { HomeTheme } = useTheme()
  const [store, dispatch] = useStore()
  const { start } = useTour()
  const [showTourPopup, setShowTourPopup] = useState(false)
  const screenIsFocused = useIsFocused()

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
        start(TourID.HomeTour)
      } else {
        dispatch({
          type: DispatchAction.UPDATE_SEEN_TOUR_PROMPT,
          payload: [true],
        })
        setShowTourPopup(true)
      }
    }
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
    start(TourID.HomeTour)
  }

  const onDismissPressed = () => {
    setShowTourPopup(false)
    dispatch({
      type: DispatchAction.ENABLE_TOURS,
      payload: [false],
    })
  }

  return (
    <>
      <FlatList
        style={{ marginBottom: 35 }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={notifications?.length > 0 ? true : false}
        decelerationRate="fast"
        ListEmptyComponent={() => (
          <View style={{ marginHorizontal: 25, marginVertical: 20 }}>
            <View>
              <NoNewUpdates />
            </View>
          </View>
        )}
        ListHeaderComponent={() => <HomeHeaderView />}
        ListFooterComponent={() => <HomeFooterView />}
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              marginHorizontal: 20,
              marginVertical: 10,
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
