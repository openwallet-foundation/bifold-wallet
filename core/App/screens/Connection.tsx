import { StackScreenProps } from '@react-navigation/stack'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import ConnectionLoading from '../components/animated/ConnectionLoading'
import Button, { ButtonType } from '../components/buttons/Button'
import { useTheme } from '../contexts/theme'
import { useNotifications } from '../hooks/notifications'
import { Screens, TabStacks, DeliveryStackParams } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

const connectionTimerDelay = 10000 // in ms

type ConnectionProps = StackScreenProps<DeliveryStackParams, Screens.Connection>

const Connection: React.FC<ConnectionProps> = ({ navigation, route }) => {
  const { connectionId } = route.params
  const { t } = useTranslation()
  const [modalVisible, setModalVisible] = useState<boolean>(true)
  const [shouldShowDelayMessage, setShouldShowDelayMessage] = useState<boolean>(false)
  const [timerDidFire, setTimerDidFire] = useState<boolean>(false)
  const [timer, setTimer] = useState<NodeJS.Timeout>()
  const [didProcessNotification, setDidProcessNotification] = useState<boolean>(false)
  const { notifications } = useNotifications()
  const { ColorPallet, TextTheme } = useTheme()
  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      flexDirection: 'column',
      backgroundColor: ColorPallet.brand.primaryBackground,
      paddingHorizontal: 25,
      paddingTop: 20,
    },
    image: {
      marginTop: 20,
    },
    messageContainer: {
      alignItems: 'center',
    },
    messageText: {
      fontWeight: 'normal',
      textAlign: 'center',
      marginTop: 90,
    },
    controlsContainer: {
      marginTop: 'auto',
      marginBottom: 20,
    },
    delayMessageText: {
      textAlign: 'center',
      marginTop: 20,
    },
  })

  const onDismissModalTouched = () => {
    timer && clearTimeout(timer)

    navigation.getParent()?.navigate(TabStacks.HomeStack, { screen: Screens.Home })

    setShouldShowDelayMessage(false)
    setModalVisible(false)
  }

  useEffect(() => {
    if (didProcessNotification) {
      return
    }

    notifications.forEach((notification) => {
      if (notification.connectionId !== connectionId) {
        return
      }

      // This delay makes the modal disappear after the offer
      // screen is already in place. Would be better to have a
      // hook like `animationDidComplete`
      setTimeout(() => {
        setShouldShowDelayMessage(false)
        setModalVisible(false)
      }, 1500)

      setDidProcessNotification(true)

      switch (notification.type) {
        case 'CredentialRecord':
          navigation.navigate(Screens.CredentialOffer, { credentialId: notification.id })

          break
        case 'ProofRecord':
          navigation.navigate(Screens.ProofRequest, { proofId: notification.id })

          break
        default:
          throw new Error('Unhandled notification type')
      }
    })
  }, [notifications])

  useEffect(() => {
    if (timerDidFire) {
      return
    }

    setModalVisible(true)

    const aTimer = setTimeout(() => {
      setShouldShowDelayMessage(true)
      setTimerDidFire(true)
    }, connectionTimerDelay)

    setTimer(aTimer)

    return () => {
      aTimer && clearTimeout(aTimer)
    }
  }, [])

  return (
    <Modal visible={modalVisible} transparent={true} animationType={'slide'}>
      <SafeAreaView style={[styles.container]}>
        <View style={[styles.messageContainer]}>
          <Text style={[TextTheme.headingThree, styles.messageText]} testID={testIdWithKey('CredentialOnTheWay')}>
            {t('Connection.JustAMoment')}
          </Text>
        </View>

        <View style={[styles.image, { minHeight: 250, alignItems: 'center', justifyContent: 'flex-end' }]}>
          <ConnectionLoading />
        </View>

        {shouldShowDelayMessage && (
          <>
            <Text style={[TextTheme.normal, styles.delayMessageText]} testID={testIdWithKey('TakingTooLong')}>
              {t('Connection.TakingTooLong')}
            </Text>

            <View style={[styles.controlsContainer]}>
              <Button
                title={t('Loading.BackToHome')}
                accessibilityLabel={t('Loading.BackToHome')}
                testID={testIdWithKey('BackToHome')}
                onPress={onDismissModalTouched}
                buttonType={ButtonType.Secondary}
              />
            </View>
          </>
        )}
      </SafeAreaView>
    </Modal>
  )
}

export default Connection
