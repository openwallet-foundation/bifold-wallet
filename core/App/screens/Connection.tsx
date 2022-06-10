import { ConnectionState } from '@aries-framework/core'
import { useConnectionById } from '@aries-framework/react-hooks'
import { useFocusEffect } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { uiConfig } from '../../configs/uiConfig'
import ConnectionLoading from '../components/animated/ConnectionLoading'
import Button, { ButtonType } from '../components/buttons/Button'
import { useTheme } from '../contexts/theme'
import { useNotifications } from '../hooks/notifications'
import { Screens, Stacks, TabStacks, DeliveryStackParams } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

const connectionTimerDelay = 10000 // in ms

type ConnectionProps = StackScreenProps<DeliveryStackParams, Screens.Connection>

const Connection: React.FC<ConnectionProps> = ({ navigation, route }) => {
  const { connectionId, threadId } = route.params
  const connection = useConnectionById(connectionId || '')
  const { t } = useTranslation()
  const [state, setState] = useState<{
    isVisible: boolean
    notificationRecord?: any
    isInitialized: boolean
    shouldShowDelayMessage: boolean
  }>({
    isVisible: true,
    isInitialized: false,
    shouldShowDelayMessage: false,
  })
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const { notifications } = useNotifications()
  const { ColorPallet, TextTheme } = useTheme()
  const { isInitialized, shouldShowDelayMessage, isVisible, notificationRecord } = state
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

  const setModalVisible = (value: boolean) => {
    setState((prev) => ({ ...prev, isVisible: value }))
  }
  const setIsInitialized = (value: boolean) => {
    setState((prev) => ({ ...prev, isInitialized: value }))
  }
  const setShouldShowDelayMessage = (value: boolean) => {
    setState((prev) => ({ ...prev, shouldShowDelayMessage: value }))
  }
  const abortTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }
  const onDismissModalTouched = () => {
    setShouldShowDelayMessage(false)
    setModalVisible(false)
    navigation.getParent()?.navigate(TabStacks.HomeStack, { screen: Screens.Home })
  }
  const startTimer = () => {
    if (!isInitialized) {
      timerRef.current = setTimeout(() => {
        setShouldShowDelayMessage(true)
        timerRef.current = null
      }, connectionTimerDelay)
      setIsInitialized(true)
    }
  }

  useFocusEffect(
    useCallback(() => {
      startTimer()
      return () => abortTimer
    }, [])
  )

  useEffect(() => {
    if (uiConfig.navigateOnConnection) {
      connection?.state === ConnectionState.Complete &&
        navigation
          .getParent()
          ?.navigate(Stacks.ContactStack, { screen: Screens.Chat, params: { connectionId: connection.id } })
    } else if (notificationRecord) {
      switch (notificationRecord.type) {
        case 'CredentialRecord':
          navigation.navigate(Screens.CredentialOffer, { credentialId: notificationRecord.id })
          break
        case 'ProofRecord':
          navigation.navigate(Screens.ProofRequest, { proofId: notificationRecord.id })
          break
        default:
          throw new Error('Unhandled notification type')
      }
    }
  }, [notificationRecord, connection])

  useEffect(() => {
    if (isVisible && isInitialized && !notificationRecord) {
      for (const notification of notifications) {
        if (
          (connectionId && notification.connectionId === connectionId) ||
          (threadId && notification.threadId == threadId)
        ) {
          setState((prev) => ({ ...prev, notificationRecord: notification, isVisible: false }))
          break
        }
      }
    }
  }, [notifications, state])

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType={'slide'}
      onRequestClose={() => {
        setModalVisible(false)
      }}
    >
      <SafeAreaView style={[styles.container]}>
        <View style={[styles.messageContainer]}>
          <Text style={[TextTheme.headingThree, styles.messageText]} testID={testIdWithKey('CredentialOnTheWay')}>
            {t('Connection.JustAMoment')}
          </Text>
        </View>

        <View style={[styles.image]}>
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
