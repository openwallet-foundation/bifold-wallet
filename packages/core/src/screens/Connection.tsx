import {
  MdocRecord,
  SdJwtVcRecord,
  W3cCredentialRecord,
} from '@credo-ts/core'
import {
  DidCommBasicMessage,
  DidCommCredentialExchangeRecord,
  DidCommProofExchangeRecord
} from '@credo-ts/didcomm'
import { CommonActions } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useCallback, useEffect, useReducer } from 'react'
import { useTranslation } from 'react-i18next'
import { DeviceEventEmitter, EmitterSubscription, BackHandler, View, StyleSheet } from 'react-native'

import { useConnectionByOutOfBandId, useOutOfBandById } from '../hooks/connections'
import { DeliveryStackParams, Screens, Stacks, TabStacks } from '../types/navigators'
import LoadingPlaceholder, { LoadingPlaceholderWorkflowType } from '../components/views/LoadingPlaceholder'
import ProofRequest from './ProofRequest'
import CredentialOffer from './CredentialOffer'

import { useServices, TOKENS } from '../container-api'
import { AttestationEventTypes } from '../types/attestation'
import { BifoldError } from '../types/error'
import { EventTypes } from '../constants'
import { testIdWithKey } from '../utils/testable'
import Toast from 'react-native-toast-message'
import { ToastType } from '../components/toast/BaseToast'
import { OpenId4VPRequestRecord } from '../modules/openid/types'
import { useAppAgent } from '../utils/agent'
import { HistoryCardType, HistoryRecord } from '../modules/history/types'

type ConnectionProps = StackScreenProps<DeliveryStackParams, Screens.Connection>

type MergeFunction = (current: LocalState, next: Partial<LocalState>) => LocalState

type NotCustomNotification = DidCommBasicMessage | DidCommCredentialExchangeRecord | DidCommProofExchangeRecord

type LocalState = {
  inProgress: boolean
  notificationRecord?: any
  attestationLoading: boolean
  shouldShowProofComponent: boolean
  shouldShowOfferComponent: boolean
  percentComplete: number
  queriedConnection?: ConnectionRecord
}

const GoalCodes = {
  proofRequestVerify: 'aries.vc.verify',
  proofRequestVerifyOnce: 'aries.vc.verify.once',
  credentialOffer: 'aries.vc.issue',
} as const

const Connection: React.FC<ConnectionProps> = ({ navigation, route }) => {
  const { oobRecordId, openIDUri, openIDPresentationUri, proofId, credentialId } = route.params
  const [
    logger,
    { useNotifications },
    { connectionTimerDelay, autoRedirectConnectionToHome, enableChat },
    attestationMonitor,
    historyManagerCurried,
    historyEnabled,
    historyEventsLogger,
  ] = useServices([
    TOKENS.UTIL_LOGGER,
    TOKENS.NOTIFICATIONS,
    TOKENS.CONFIG,
    TOKENS.UTIL_ATTESTATION_MONITOR,
    TOKENS.FN_LOAD_HISTORY,
    TOKENS.HISTORY_ENABLED,
    TOKENS.HISTORY_EVENTS_LOGGER,
  ])
  const connTimerDelay = connectionTimerDelay ?? 10000 // in ms
  const notifications = useNotifications({ openIDUri: openIDUri, openIDPresentationUri: openIDPresentationUri })
  const { agent } = useAppAgent()
  const oobRecord = useOutOfBandById(oobRecordId ?? '')
  const connection = useConnectionByOutOfBandId(oobRecordId ?? '')

  const { t } = useTranslation()
  const merge: MergeFunction = (current, next) => ({ ...current, ...next })
  const [state, dispatch] = useReducer(merge, {
    inProgress: true,
    notificationRecord: undefined,
    attestationLoading: false,
    shouldShowProofComponent: false,
    shouldShowOfferComponent: false,
    percentComplete: 30,
    queriedConnection: undefined,
  })
  const styles = StyleSheet.create({
    pageContainer: {
      flex: 1,
    },
  })

  const logHistoryRecord = useCallback(() => {
    try {
      if (!(agent && historyEnabled)) {
        logger.trace(
          `[${CredentialOffer.name}]:[logHistoryRecord] Skipping history log, either history function disabled or agent undefined!`
        )
        return
      }
      const historyManager = historyManagerCurried(agent)

      if (!connection) {
        logger.error(`[${CredentialOffer.name}]:[logHistoryRecord] Cannot save history, credential undefined!`)
        return
      }

      /** Save history record for connection */
      const recordData: HistoryRecord = {
        type: HistoryCardType.Connection,
        message: HistoryCardType.Connection,
        createdAt: connection.createdAt,
        correspondenceId: connection.id,
        correspondenceName: connection.theirLabel,
      }
      historyManager.saveHistory(recordData)
    } catch (err: unknown) {
      logger.error(`[${CredentialOffer.name}]:[logHistoryRecord] Error saving history: ${err}`)
    }
  }, [agent, historyEnabled, logger, historyManagerCurried, connection])

  const handleNavigation = useCallback(
    (connectionId: string) => {
      dispatch({ inProgress: false })
      if (enableChat) {
        navigation.getParent()?.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [{ name: Stacks.TabStack }, { name: Screens.Chat, params: { connectionId } }],
          })
        )
      } else {
        navigation.getParent()?.navigate(TabStacks.HomeStack, { screen: Screens.Home })
        Toast.show({
          type: ToastType.Success,
          text1: t('Connection.ConnectionCompleted'),
        })
      }
    },
    [dispatch, navigation, enableChat, t]
  )

  const onDismissModalTouched = useCallback(() => {
    dispatch({ inProgress: false })
    navigation.getParent()?.navigate(TabStacks.HomeStack, { screen: Screens.Home })
  }, [dispatch, navigation])

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
      navigation.setOptions({ title: t('Screens.ProofRequest') })
      dispatch({ inProgress: false, shouldShowProofComponent: true })
      return
    }

    if (credentialId) {
      navigation.setOptions({ title: t('Screens.CredentialOffer') })
      dispatch({ inProgress: false, shouldShowOfferComponent: true })
      return
    }
  }, [proofId, credentialId, navigation, t])

  useEffect(() => {
    if (state.inProgress) {
      return
    }
    const goalCode = oobRecord?.outOfBandInvitation?.goalCode

    if (historyEventsLogger.logConnection && goalCode != GoalCodes.proofRequestVerifyOnce) {
      logHistoryRecord()
    }
  }, [
    state.inProgress,
    state.percentComplete,
    connTimerDelay,
    historyEventsLogger.logConnectionRemoved,
    logHistoryRecord,
    historyEventsLogger.logConnection,
    oobRecord?.outOfBandInvitation?.goalCode,
  ])

  useEffect(() => {
    if (!oobRecord || !state.inProgress) {
      return
    }

    // Use queriedConnection as fallback if the hook hasn't found the connection yet
    const actualConnection = connection || state.queriedConnection

    // If we have a connection, but no goal code, we should navigate
    // to Chat
    if (
      actualConnection &&
      !(Object.values(GoalCodes) as [string]).includes(oobRecord?.outOfBandInvitation.goalCode ?? '')
    ) {
      logger?.info('Connection: Handling connection without goal code, navigate to Chat')

      handleNavigation(actualConnection.id)

      return
    }

    // At this point we should be waiting for a notification
    // to be processed
    if (!state.notificationRecord) {
      return
    }

    // Connectionless proof request, we don't have connectionless offers.
    if (!actualConnection) {
      navigation.setOptions({ title: t('Screens.ProofRequest') })
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

      navigation.setOptions({ title: t('Screens.ProofRequest') })
      dispatch({ inProgress: false, shouldShowProofComponent: true })

      return
    }

    if (goalCode === GoalCodes.credentialOffer) {
      logger?.info(`Connection: Handling ${goalCode} goal code, navigate to CredentialOffer`)

      navigation.setOptions({ title: t('Screens.CredentialOffer') })
      dispatch({ inProgress: false, shouldShowProofComponent: false, shouldShowOfferComponent: true })

      return
    }

    logger?.info(`Connection: Unable to handle ${goalCode} goal code`)

    handleNavigation(actualConnection.id)
  }, [
    oobRecord,
    state.inProgress,
    connection,
    state.queriedConnection,
    logger,
    dispatch,
    navigation,
    t,
    state.notificationRecord,
    handleNavigation,
  ])

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
      (state.notificationRecord as SdJwtVcRecord).type === 'SdJwtVcRecord' ||
      (state.notificationRecord as MdocRecord).type === 'MdocRecord'
    ) {
      logger?.info(`Connection: Handling OpenID4VCi Credential, navigate to CredentialOffer`)
      dispatch({ inProgress: false })
      navigation.replace(Screens.OpenIDCredentialOffer, {
        credential: state.notificationRecord,
      })
      return
    }

    if ((state.notificationRecord as OpenId4VPRequestRecord).type === 'OpenId4VPRequestRecord') {
      dispatch({ inProgress: false })
      navigation.replace(Screens.OpenIDProofPresentation, { credential: state.notificationRecord })
    }
  }, [logger, navigation, state])

  useEffect(() => {
    if (!state.inProgress || state.notificationRecord) {
      return
    }

    const actualConnection = connection || state.queriedConnection

    const checkNotifications = async () => {
      // First, try to find the connection for this OOB record directly from the agent
      // This handles cases where the connection was created but not yet indexed by the hook
      let foundConnection = actualConnection
      if (!foundConnection && agent && oobRecordId) {
        try {
          const allConnections = await agent.connections.getAll()
          foundConnection = allConnections.find((conn) => conn.outOfBandId === oobRecordId)
          if (foundConnection) {
            // Store the found connection in state so other useEffects can access it
            dispatch({ queriedConnection: foundConnection })
          }
        } catch (error) {
          // Silently continue if query fails
          logger.debug(`[Connection] Failed to query connections, continuing: ${error}`)
        }
      }

      for (const notification of notifications) {
        // no action taken for BasicMessageRecords
        if ((notification as DidCommBasicMessage).type === 'BasicMessageRecord') {
          continue
        }

        const notifConnectionId = (notification as NotCustomNotification).connectionId
        const notifThreadId = (notification as NotCustomNotification)?.threadId
        const matchesConnection = foundConnection && notifConnectionId === foundConnection.id
        const matchesOobThread = oobRecord?.getTags()?.invitationRequestsThreadIds?.includes(notifThreadId ?? '')

        // Check if this notification is for a reused connection
        const matchesReuseConnection = oobRecord?.reuseConnectionId && notifConnectionId === oobRecord.reuseConnectionId

        // For robustness, also check if the notification's connection matches this OOB record
        let matchesOobConnection = false
        if (agent && oobRecordId && notifConnectionId && !foundConnection) {
          try {
            // Get all connections
            const allConnections = await agent.connections.getAll()

            // Find any connection that references this OOB record ID
            const oobConnection = allConnections.find((conn) => conn.outOfBandId === oobRecordId)

            // If we found a connection for this OOB record and the notification is for that connection
            if (oobConnection && oobConnection.id === notifConnectionId) {
              matchesOobConnection = true
            }
          } catch (error) {
            logger.debug(`[Connection] Failed to query connections for OOB match, continuing: ${error} `)
          }
        }

        if (matchesConnection || matchesOobThread || matchesReuseConnection || matchesOobConnection) {
          dispatch({ notificationRecord: notification })
          break
        }

        if (
          (notification as W3cCredentialRecord).type === 'W3cCredentialRecord' ||
          (notification as SdJwtVcRecord).type === 'SdJwtVcRecord' ||
          (notification as MdocRecord).type === 'MdocRecord' ||
          (notification as OpenId4VPRequestRecord).type === 'OpenId4VPRequestRecord'
        ) {
          dispatch({ notificationRecord: notification })
          break
        }
      }
    }

    checkNotifications()
  }, [
    state.inProgress,
    state.notificationRecord,
    state.queriedConnection,
    notifications,
    logger,
    connection,
    oobRecord,
    dispatch,
    oobRecordId,
    agent,
  ])

  const loadingPlaceholderWorkflowType = () => {
    if (state.shouldShowProofComponent) {
      return LoadingPlaceholderWorkflowType.ProofRequested
    }

    if (state.shouldShowOfferComponent) {
      return LoadingPlaceholderWorkflowType.ReceiveOffer
    }

    return LoadingPlaceholderWorkflowType.Connection
  }

  const displayComponent = () => {
    if (state.inProgress || state.attestationLoading) {
      return (
        <LoadingPlaceholder
          workflowType={loadingPlaceholderWorkflowType()}
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

  return <View style={styles.pageContainer}>{displayComponent()}</View>
}

export default Connection
