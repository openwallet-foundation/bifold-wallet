import {
  BasicMessageRecord,
  CredentialExchangeRecord,
  ProofExchangeRecord,
  SdJwtVcRecord,
  W3cCredentialRecord,
} from '@credo-ts/core'
import { CommonActions } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useCallback, useEffect, useReducer } from 'react'
import { DeviceEventEmitter, EmitterSubscription, BackHandler, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useTheme } from '../contexts/theme'
import { useConnectionByOutOfBandId, useOutOfBandById } from '../hooks/connections'
import { DeliveryStackParams, Screens, Stacks, TabStacks } from '../types/navigators'
import LoadingPlaceholder from '../components/views/LoadingPlaceholder'
import ProofRequest from './ProofRequest'
import CredentialOffer from './CredentialOffer'

import { useServices, TOKENS } from './../container-api'
import { AttestationEventTypes } from '../types/attestation'
import { BifoldError } from '../types/error'
import { EventTypes } from '../constants'
import { testIdWithKey } from '../utils/testable'

type ConnectionProps = StackScreenProps<DeliveryStackParams, Screens.Connection>

type MergeFunction = (current: LocalState, next: Partial<LocalState>) => LocalState

type NotCustomNotification = BasicMessageRecord | CredentialExchangeRecord | ProofExchangeRecord

type LocalState = {
  inProgress: boolean
  notificationRecord?: any
  attestationLoading: boolean
  shouldShowProofComponent: boolean
  shouldShowOfferComponent: boolean
  percentComplete: number
}

const GoalCodes = {
  proofRequestVerify: 'aries.vc.verify',
  proofRequestVerifyOnce: 'aries.vc.verify.once',
  credentialOffer: 'aries.vc.issue',
} as const

const Connection: React.FC<ConnectionProps> = ({ navigation, route }) => {
  const { oobRecordId, openIDUri, proofId, credentialId } = route.params
  const { ColorPallet, TextTheme } = useTheme()
  const [logger, { useNotifications }, { connectionTimerDelay, autoRedirectConnectionToHome }, attestationMonitor] =
    useServices([TOKENS.UTIL_LOGGER, TOKENS.NOTIFICATIONS, TOKENS.CONFIG, TOKENS.UTIL_ATTESTATION_MONITOR])
  const connTimerDelay = connectionTimerDelay ?? 10000 // in ms
  const notifications = useNotifications({ openIDUri: openIDUri })
  const oobRecord = useOutOfBandById(oobRecordId ?? '')
  const connection = useConnectionByOutOfBandId(oobRecordId ?? '')
  const merge: MergeFunction = (current, next) => ({ ...current, ...next })
  const [state, dispatch] = useReducer(merge, {
    inProgress: true,
    notificationRecord: undefined,
    attestationLoading: false,
    shouldShowProofComponent: false,
    shouldShowOfferComponent: false,
    percentComplete: 30,
  })
  const styles = StyleSheet.create({
    container: {
      height: '100%',
      backgroundColor: ColorPallet.brand.modalPrimaryBackground,
      padding: 20,
    },
    pageContainer: {
      flex: 1,
    },
    image: {
      marginTop: 20,
    },
    messageContainer: {
      alignItems: 'center',
    },
    messageText: {
      fontWeight: TextTheme.normal.fontWeight,
      textAlign: 'center',
      marginTop: 30,
    },
    controlsContainer: {
      marginTop: 'auto',
      margin: 20,
    },
  })

  const onDismissModalTouched = () => {
    dispatch({ inProgress: false })
    navigation.getParent()?.navigate(TabStacks.HomeStack, { screen: Screens.Home })
  }

  useEffect(() => {
    if (!attestationMonitor) {
      return
    }

    const handleStartedAttestation = () => {
      dispatch({ attestationLoading: true })
    }

    const handleStartedCompleted = () => {
      dispatch({ attestationLoading: false })
    }

    const handleFailedAttestation = (error: BifoldError) => {
      DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
    }

    const subscriptions = Array<EmitterSubscription>()
    subscriptions.push(DeviceEventEmitter.addListener(AttestationEventTypes.Started, handleStartedAttestation))
    subscriptions.push(DeviceEventEmitter.addListener(AttestationEventTypes.Completed, handleStartedCompleted))
    subscriptions.push(DeviceEventEmitter.addListener(AttestationEventTypes.FailedHandleProof, handleFailedAttestation))
    subscriptions.push(DeviceEventEmitter.addListener(AttestationEventTypes.FailedHandleOffer, handleFailedAttestation))
    subscriptions.push(
      DeviceEventEmitter.addListener(AttestationEventTypes.FailedRequestCredential, handleFailedAttestation)
    )

    return () => {
      subscriptions.forEach((subscription) => subscription.remove())
    }
  }, [attestationMonitor])

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true)
    return () => backHandler.remove()
  }, [])

  useEffect(() => {
    if (proofId) {
      dispatch({ inProgress: false, shouldShowProofComponent: true })
      return
    }

    if (credentialId) {
      dispatch({ inProgress: false, shouldShowOfferComponent: true })
      return
    }
  }, [proofId, credentialId])

  useEffect(() => {
    if (!oobRecord || !state.inProgress) {
      return
    }

    // If we have a connection, but no goal code, we should navigate
    // to Chat
    if (connection && !(Object.values(GoalCodes) as [string]).includes(oobRecord?.outOfBandInvitation.goalCode ?? '')) {
      logger?.info('Connection: Handling connection without goal code, navigate to Chat')

      dispatch({ inProgress: false })
      navigation.getParent()?.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [{ name: Stacks.TabStack }, { name: Screens.Chat, params: { connectionId: connection.id } }],
        })
      )

      return
    }

    // At this point we should be waiting for a notification
    // to be processed
    if (!state.notificationRecord) {
      return
    }

    // Connectionless proof request, we don't have connectionless offers.
    if (!connection) {
      dispatch({ inProgress: false, shouldShowProofComponent: true })

      return
    }

    // At this point, we have connection based proof or offer with
    // a goal code.

    if (!oobRecord) {
      logger?.error(`Connection: No OOB record where one is expected`)

      return
    }

    const { goalCode } = oobRecord.outOfBandInvitation
    if (goalCode === GoalCodes.proofRequestVerify || goalCode === GoalCodes.proofRequestVerifyOnce) {
      logger?.info(`Connection: Handling ${goalCode} goal code, navigate to ProofRequest`)

      dispatch({ inProgress: false, shouldShowProofComponent: true })

      return
    }

    if (goalCode === GoalCodes.credentialOffer) {
      logger?.info(`Connection: Handling ${goalCode} goal code, navigate to CredentialOffer`)

      dispatch({ inProgress: false, shouldShowProofComponent: false, shouldShowOfferComponent: true })

      return
    }

    logger?.info(`Connection: Unable to handle ${goalCode} goal code`)

    dispatch({ inProgress: false })
    navigation.getParent()?.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [{ name: Stacks.TabStack }, { name: Screens.Chat, params: { connectionId: connection.id } }],
      })
    )
  }, [oobRecord, state.inProgress, connection, logger, dispatch, navigation, state.notificationRecord])

  // This hook will monitor notification for openID type credentials
  // where there is not connection or oobID present
  useEffect(() => {
    if (!state.inProgress) {
      return
    }

    if (!state.notificationRecord) {
      return
    }

    if (
      (state.notificationRecord as W3cCredentialRecord).type === 'W3cCredentialRecord' ||
      (state.notificationRecord as SdJwtVcRecord).type === 'SdJwtVcRecord'
    ) {
      logger?.info(`Connection: Handling OpenID4VCi Credential, navigate to CredentialOffer`)
      dispatch({ inProgress: false })
      navigation.replace(Screens.OpenIDCredentialDetails, { credential: state.notificationRecord })
      return
    }
  }, [state])

  useEffect(() => {
    if (!state.inProgress || state.notificationRecord) {
      return
    }

    for (const notification of notifications) {
      // no action taken for BasicMessageRecords
      if ((notification as BasicMessageRecord).type === 'BasicMessageRecord') {
        logger?.info('Connection: BasicMessageRecord, skipping')
        continue
      }

      if (
        (connection && (notification as NotCustomNotification).connectionId === connection.id) ||
        oobRecord
          ?.getTags()
          ?.invitationRequestsThreadIds?.includes((notification as NotCustomNotification)?.threadId ?? '')
      ) {
        logger?.info(`Connection: Handling notification ${(notification as NotCustomNotification).id}`)

        dispatch({ notificationRecord: notification })
        break
      }

      if ((notification as W3cCredentialRecord).type === 'W3cCredentialRecord') {
        dispatch({ notificationRecord: notification })
        break
      }

      if ((notification as SdJwtVcRecord).type === 'SdJwtVcRecord') {
        dispatch({ notificationRecord: notification })
        break
      }
    }
  }, [state.inProgress, state.notificationRecord, notifications, logger, connection, oobRecord, dispatch])

  const displayComponent = () => {
    if (state.inProgress || state.attestationLoading) {
      return (
        <LoadingPlaceholder
          timeoutDurationInMs={connTimerDelay}
          loadingProgressPercent={state.percentComplete}
          onCancelTouched={onDismissModalTouched}
          onTimeoutTriggered={autoRedirectConnectionToHome ? onDismissModalTouched : undefined}
          testID={testIdWithKey('ConnectionLoading')}
        />
      )
    }

    if (state.shouldShowProofComponent) {
      return <ProofRequest proofId={proofId ?? state.notificationRecord.id} navigation={navigation} />
    }

    if (state.shouldShowOfferComponent) {
      return <CredentialOffer credentialId={credentialId ?? state.notificationRecord.id} navigation={navigation} />
    }
  }

  return (
    <SafeAreaView style={[styles.pageContainer]} edges={['bottom', 'left', 'right']}>
      <ScrollView>{displayComponent()}</ScrollView>
    </SafeAreaView>
  )
}

export default Connection
