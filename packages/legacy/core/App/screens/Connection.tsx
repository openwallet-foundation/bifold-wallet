import {
  DidExchangeState,
  ProofExchangeRecord,
  CredentialExchangeRecord as CredentialRecord,
} from '@aries-framework/core'
import { useConnectionById, useAgent } from '@aries-framework/react-hooks'
import { useFocusEffect } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useCallback, useEffect, useRef, useReducer } from 'react'
import { useTranslation } from 'react-i18next'
import { AccessibilityInfo, Modal, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import Button, { ButtonType } from '../components/buttons/Button'
import { useAnimatedComponents } from '../contexts/animated-components'
import { useConfiguration } from '../contexts/configuration'
import { useTheme } from '../contexts/theme'
import { useNotifications } from '../hooks/notifications'
import { Screens, TabStacks, DeliveryStackParams } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

type ConnectionProps = StackScreenProps<DeliveryStackParams, Screens.Connection>

type MergeFunction = (current: LocalState, next: Partial<LocalState>) => LocalState

type LocalState = {
  isVisible: boolean
  isInitialized: boolean
  shouldShowDelayMessage: boolean
  connectionIsActive: boolean
  notificationRecord?: ProofExchangeRecord | CredentialRecord
}

const Connection: React.FC<ConnectionProps> = ({ navigation, route }) => {
  const { connectionTimerDelay, autoRedirectConnectionToHome } = useConfiguration()
  const connTimerDelay = connectionTimerDelay ?? 10000 // in ms

  if (!navigation || !route) {
    throw new Error('Connection route props were not set properly')
  }

  const { connectionId, threadId } = route.params
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const connection = connectionId ? useConnectionById(connectionId) : undefined
  const { agent } = useAgent()
  const { t } = useTranslation()
  const { notifications } = useNotifications()
  const { ColorPallet, TextTheme } = useTheme()
  const { ConnectionLoading } = useAnimatedComponents()
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
  const merge: MergeFunction = (current, next) => ({ ...current, ...next })
  const [state, dispatch] = useReducer(merge, {
    isVisible: true,
    isInitialized: false,
    shouldShowDelayMessage: false,
    connectionIsActive: false,
  })

  const startTimer = () => {
    if (!state.isInitialized) {
      timerRef.current = setTimeout(() => {
        dispatch({ shouldShowDelayMessage: true })
        timerRef.current = null
      }, connTimerDelay)

      dispatch({ isInitialized: true })
    }
  }

  const abortTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const onDismissModalTouched = () => {
    dispatch({ shouldShowDelayMessage: false, isVisible: false })
    navigation.getParent()?.navigate(TabStacks.HomeStack, { screen: Screens.Home })
  }

  useEffect(() => {
    // If `autoRedirectConnectionToHome` is set to true,
    // navigate to the home screen.
    if (autoRedirectConnectionToHome) {
      navigation.getParent()?.navigate(TabStacks.HomeStack, { screen: Screens.Home })

      return
    }

    // Note: V1 connections are not required to enter the `Completed` state and may
    // remain at `RequestSent` indefinitely. This is a known issue that is addressed
    // in higher protocol versions.
    if (
      connection &&
      (connection.state === DidExchangeState.Completed || connection.state === DidExchangeState.RequestSent)
    ) {
      dispatch({ connectionIsActive: true })
      agent?.mediationRecipient.initiateMessagePickup()

      // No goal code, we don't know what to expect next,
      // navigate to the contact details.
      navigation
        .getParent()
        ?.navigate(TabStacks.HomeStack, { screen: Screens.ContactDetails, params: { connectionId } })
    }

    return () => {
      connection === undefined && abortTimer()
    }
  }, [connection])

  useEffect(() => {
    // When the delay message is shown, we should
    // automatically navigate to the home screen if
    // configuration is set to do so.
    if (
      autoRedirectConnectionToHome &&
      state.shouldShowDelayMessage &&
      state.connectionIsActive &&
      !state.notificationRecord
    ) {
      dispatch({ shouldShowDelayMessage: false, isVisible: false })
      navigation.getParent()?.navigate(TabStacks.HomeStack, { screen: Screens.Home })
    }
  }, [state.shouldShowDelayMessage])

  useEffect(() => {
    if (shouldShowDelayMessage && !notificationRecord) {
      AccessibilityInfo.announceForAccessibility(t('Connection.TakingTooLong'))
    }
  }, [shouldShowDelayMessage])

  useFocusEffect(
    useCallback(() => {
      startTimer()
      return () => abortTimer
    }, [])
  )

  useEffect(() => {
    // This effect is used to handle the case where this screen
    // needs to automatically process a notification.
    if (state.notificationRecord) {
      switch (state.notificationRecord.type) {
        case 'ProofRecord':
          if (!connection || !connection.id) {
            navigation.navigate(Screens.ProofRequest, { proofId: state.notificationRecord.id })
          }
          break
        default:
          throw new Error('Unhandled notification type')
      }
    }
  }, [state.notificationRecord])

  useEffect(() => {
    if (state.isVisible && state.isInitialized && !state.notificationRecord) {
      for (const notification of notifications) {
        if (
          (connectionId && notification.connectionId === connectionId) ||
          (threadId && notification.threadId == threadId)
        ) {
          dispatch({ notificationRecord: notification, isVisible: false })
          break
        }
      }
    }

    return () => {
      notifications === undefined && abortTimer()
    }
  }, [notifications, state])

  return (
    <Modal
      visible={state.isVisible}
      transparent={true}
      animationType={'slide'}
      onRequestClose={() => {
        dispatch({ isVisible: false })
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

          {state.shouldShowDelayMessage && (
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
