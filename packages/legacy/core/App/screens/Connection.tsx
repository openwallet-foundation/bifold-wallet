import { DidExchangeState } from '@aries-framework/core'
import { useConnectionById, useAgent } from '@aries-framework/react-hooks'
import { useFocusEffect } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useCallback, useEffect, useRef, useReducer } from 'react'
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

type LocalState = {
  isVisible: boolean
  notificationRecord?: any
  isInitialized: boolean
  shouldShowDelayMessage: boolean
  connectionIsActive: boolean
}

type MergeFunction = (prev: LocalState, next: Partial<LocalState>) => LocalState

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
  const timerRef = useRef<NodeJS.Timeout | null>(null)
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

  const merge: MergeFunction = (prev, next) => {
    return { ...prev, ...next }
  }

  const [state, dispatch] = useReducer(merge, {
    isVisible: true,
    isInitialized: false,
    shouldShowDelayMessage: false,
    connectionIsActive: false,
  })

  const onDismissModalTouched = () => {
    dispatch({ shouldShowDelayMessage: false, isVisible: false })
    navigation.getParent()?.navigate(TabStacks.HomeStack, { screen: Screens.Home })
  }

  const abortTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const startTimer = () => {
    if (!state.isInitialized) {
      timerRef.current = setTimeout(() => {
        dispatch({ shouldShowDelayMessage: false })
        timerRef.current = null
      }, connTimerDelay)

      dispatch({ isInitialized: true })
    }
  }

  useEffect(() => {
    // FIX:(jl) There may be a better way to fetch queued messages.
    // Under investigation.
    if (connection && connection.state === DidExchangeState.Completed) {
      dispatch({ connectionIsActive: true })
      agent?.mediationRecipient.initiateMessagePickup()
    }
  }, [connection])

  useEffect(() => {
    if (
      autoRedirectConnectionToHome &&
      state.shouldShowDelayMessage &&
      state.connectionIsActive &&
      !state.notificationRecord
    ) {
      dispatch({ shouldShowDelayMessage: false, isVisible: false })

      navigation.getParent()?.navigate(TabStacks.HomeStack, { screen: Screens.Home })
    }
  }, [state])

  useFocusEffect(
    useCallback(() => {
      startTimer()
      return () => abortTimer
    }, [])
  )

  useEffect(() => {
    if (state.notificationRecord) {
      switch (state.notificationRecord.type) {
        case 'CredentialRecord':
          navigation.navigate(Screens.CredentialOffer, { credentialId: state.notificationRecord.id })
          break
        case 'ProofRecord':
          navigation.navigate(Screens.ProofRequest, { proofId: state.notificationRecord.id })
          break
        default:
          throw new Error('Unhandled notification type')
      }
    }
  }, [state])

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
