import { DidExchangeState } from '@aries-framework/core'
import { useConnectionById, useAgent } from '@aries-framework/react-hooks'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useEffect, useReducer } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import Button, { ButtonType } from '../components/buttons/Button'
import { useAnimatedComponents } from '../contexts/animated-components'
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
}

const Connection: React.FC<ConnectionProps> = ({ navigation, route }) => {
  // TODO(jl): When implementing goal codes the `autoRedirectConnectionToHome`
  // logic should be: if this property is set, rather than showing the
  // delay message, the user should be redirected to the home screen.
  // const { connectionTimerDelay } = useConfiguration()
  // const connTimerDelay = connectionTimerDelay ?? 10000 // in ms

  if (!navigation || !route) {
    throw new Error('Connection route props were not set properly')
  }

  const { connectionId } = route.params
  // const timerRef = useRef<NodeJS.Timeout | null>(null)
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

  // const startTimer = () => {
  //   if (!state.isInitialized) {
  //     timerRef.current = setTimeout(() => {
  //       dispatch({ shouldShowDelayMessage: true })
  //       timerRef.current = null
  //     }, connTimerDelay)

  //     dispatch({ isInitialized: true })
  //   }
  // }

  // const abortTimer = () => {
  //   if (timerRef.current) {
  //     clearTimeout(timerRef.current)
  //     timerRef.current = null
  //   }
  // }

  const onDismissModalTouched = () => {
    dispatch({ shouldShowDelayMessage: false, isVisible: false })
    navigation.getParent()?.navigate(TabStacks.HomeStack, { screen: Screens.Home })
  }

  useEffect(() => {
    // Wait for OOB proof notification to arrive.
    if (!connection || !connectionId) {
      return
    }

    // Note: V1 connections are not required to enter the `Completed` state and may
    // remain at `RequestSent` indefinitely. This is a known issue that is addressed
    // in higher protocol versions.
    if (connection.state === DidExchangeState.Completed || connection.state === DidExchangeState.RequestSent) {
      dispatch({ connectionIsActive: true })
      agent?.mediationRecipient.initiateMessagePickup()

      // No goal code, we don't know what to expect next,
      // navigate to the chat screen.
      navigation.navigate(Screens.Chat, { connectionId })
      dispatch({ isVisible: false })
    }
  }, [connection])

  // useMemo(() => {
  //   startTimer()
  //   return () => abortTimer
  // }, [])

  // useFocusEffect(
  //   useCallback(() => {
  //     console.log('************* FOCUS *************')
  //     startTimer()
  //     return () => abortTimer
  //   }, [])
  // )

  useEffect(() => {
    if (state.isVisible) {
      for (const notification of notifications) {
        if (!connection && notification.state === 'request-received') {
          navigation.navigate(Screens.ProofRequest, { proofId: notification.id })
          dispatch({ isVisible: false })
          break
        }
      }
    }
  }, [notifications])

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
