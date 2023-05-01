import { DidExchangeState } from '@aries-framework/core'
import { useConnectionById, useAgent } from '@aries-framework/react-hooks'
import { useFocusEffect } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import Button, { ButtonType } from '../components/buttons/Button'
import { useAnimatedComponents } from '../contexts/animated-components'
import { useConfiguration } from '../contexts/configuration'
import { useTheme } from '../contexts/theme'
import { useNotifications } from '../hooks/notifications'
import { Screens, TabStacks, DeliveryStackParams } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

type ConnectionProps = StackScreenProps<DeliveryStackParams, Screens.Connection>

const Connection: React.FC<ConnectionProps> = ({ navigation, route }) => {
  const { connectionTimerDelay, autoRedirectConnectionToHome } = useConfiguration()
  const connTimerDelay = connectionTimerDelay ?? 10000 // in ms

  if (!navigation || !route) {
    throw new Error('Connection route props were not set properly')
  }

  const { connectionId, threadId } = route.params
  const connection = connectionId ? useConnectionById(connectionId) : undefined
  const { agent } = useAgent()
  const { t } = useTranslation()
  const [state, setState] = useState<{
    isVisible: boolean
    notificationRecord?: any
    isInitialized: boolean
    shouldShowDelayMessage: boolean
    connectionIsActive: boolean
  }>({
    isVisible: true,
    isInitialized: false,
    shouldShowDelayMessage: false,
    connectionIsActive: false,
  })
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const { notifications } = useNotifications()
  const { ColorPallet, TextTheme } = useTheme()
  const { ConnectionLoading } = useAnimatedComponents()
  const { isInitialized, shouldShowDelayMessage, isVisible, notificationRecord, connectionIsActive } = state
  const styles = StyleSheet.create({
    container: {
      height: '100%',
      backgroundColor: ColorPallet.brand.modalPrimaryBackground,
      padding: 20,
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
      marginTop: 30,
    },
    controlsContainer: {
      marginTop: 'auto',
      margin: 20,
    },
    delayMessageText: {
      textAlign: 'center',
      marginTop: 20,
    },
  })

  useEffect(() => {
    // FIX:(jl) There may be a better way to fetch queued messages.
    // Under investigation.
    if (connection && connection.state === DidExchangeState.Completed) {
      setState((prev) => ({ ...prev, connectionIsActive: true }))
      agent?.mediationRecipient.initiateMessagePickup()
    }
  }, [connection])

  const setModalVisible = (value: boolean) => {
    setState((prev) => ({ ...prev, isVisible: value }))
  }
  const setIsInitialized = (value: boolean) => {
    setState((prev) => ({ ...prev, isInitialized: value }))
  }
  const setShouldShowDelayMessage = (value: boolean) => {
    setState((prev) => ({ ...prev, shouldShowDelayMessage: value }))
  }
  useEffect(() => {
    if (autoRedirectConnectionToHome && shouldShowDelayMessage && connectionIsActive && !notificationRecord) {
      setShouldShowDelayMessage(false)
      setModalVisible(false)
      navigation.getParent()?.navigate(TabStacks.HomeStack, { screen: Screens.Home })
    }
  }, [shouldShowDelayMessage])
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
      }, connTimerDelay)
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
    if (notificationRecord) {
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
  }, [notificationRecord])

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
      <SafeAreaView style={{ backgroundColor: ColorPallet.brand.modalPrimaryBackground }}>
        <ScrollView style={[styles.container]}>
          <View style={[styles.messageContainer]}>
            <Text
              style={[TextTheme.modalHeadingThree, styles.messageText]}
              testID={testIdWithKey('CredentialOnTheWay')}
            >
              {t('Connection.JustAMoment')}
            </Text>
          </View>

          <View style={[styles.image]}>
            <ConnectionLoading />
          </View>

          {shouldShowDelayMessage && (
            <Text style={[TextTheme.modalNormal, styles.delayMessageText]} testID={testIdWithKey('TakingTooLong')}>
              {t('Connection.TakingTooLong')}
            </Text>
          )}
        </ScrollView>
        <View style={[styles.controlsContainer]}>
          <Button
            title={t('Loading.BackToHome')}
            accessibilityLabel={t('Loading.BackToHome')}
            testID={testIdWithKey('BackToHome')}
            onPress={onDismissModalTouched}
            buttonType={ButtonType.ModalSecondary}
          />
        </View>
      </SafeAreaView>
    </Modal>
  )
}

export default Connection
