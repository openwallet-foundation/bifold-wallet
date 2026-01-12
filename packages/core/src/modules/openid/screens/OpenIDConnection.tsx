import {
  MdocRecord,
  SdJwtVcRecord,
  W3cCredentialRecord,
  BasicMessageRecord,
  CredentialExchangeRecord,
  ProofExchangeRecord
} from '@credo-ts/core'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useEffect, useReducer } from 'react'
import { BackHandler, View, StyleSheet } from 'react-native'

import { useConnectionByOutOfBandId, useOutOfBandById } from '../../../hooks/connections'
import { DeliveryStackParams, Screens } from '../../../types/navigators'
import { useServices, TOKENS } from '../../../container-api'
import { OpenId4VPRequestRecord } from '../../../modules/openid/types'
import { useAppAgent } from '../../../utils/agent'
import LoadingSpinner from '../../../components/animated/LoadingSpinner'


type NotCustomNotification = BasicMessageRecord | CredentialExchangeRecord | ProofExchangeRecord

type ConnectionProps = StackScreenProps<DeliveryStackParams, Screens.OpenIDConnection>

type MergeFunction = (current: LocalState, next: Partial<LocalState>) => LocalState

type LocalState = {
  notificationRecord?: any
}

const merge: MergeFunction = (current, next) => ({ ...current, ...next })

const OpenIDConnection: React.FC<ConnectionProps> = ({ navigation, route }) => {
  const { openIDUri, openIDPresentationUri, oobRecordId } = route.params
  const [
    logger,
    { useNotifications },
    historyEnabled,
  ] = useServices([
    TOKENS.UTIL_LOGGER,
    TOKENS.NOTIFICATIONS,
    TOKENS.HISTORY_ENABLED,
  ])
  const notifications = useNotifications({ openIDUri: openIDUri, openIDPresentationUri: openIDPresentationUri })
  const { agent } = useAppAgent()
  const oobRecord = useOutOfBandById(oobRecordId ?? '')
  const connection = useConnectionByOutOfBandId(oobRecordId ?? '')

  const [state, dispatch] = useReducer(merge, {
    notificationRecord: undefined,
  })
  const styles = StyleSheet.create({
    pageContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  })

  useEffect(() => {
    try {
      if (!(agent && historyEnabled)) {
        logger.trace(
          `[${Screens.OpenIDConnection}]:[logHistoryRecord] Skipping history log, either history function disabled or agent undefined!`
        )
        return
      }
    } catch (err: unknown) {
      logger.error(`[${Screens.OpenIDConnection}]:[logHistoryRecord] Error saving history: ${err}`)
    }
  }, [])

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true)
    return () => backHandler.remove()
  }, [])

  useEffect(() => {
    for (const notification of notifications) {
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
  }, [state.notificationRecord, notifications, logger, dispatch])

  useEffect(() => {

    if (!state.notificationRecord) {
      return
    }

    if (
      (state.notificationRecord as W3cCredentialRecord).type === 'W3cCredentialRecord' ||
      (state.notificationRecord as SdJwtVcRecord).type === 'SdJwtVcRecord' ||
      (state.notificationRecord as MdocRecord).type === 'MdocRecord'
    ) {
      logger?.info(`Connection: Handling OpenID4VCi Credential, navigate to CredentialOffer`)
      navigation.replace(Screens.OpenIDCredentialOffer, {
        credential: state.notificationRecord,
      })
      return
    }

    if ((state.notificationRecord as OpenId4VPRequestRecord).type === 'OpenId4VPRequestRecord') {
      navigation.replace(Screens.OpenIDProofPresentation, { credential: state.notificationRecord })
    }

  }, [logger, navigation, state])

  return (
    <View style={styles.pageContainer}>
      <LoadingSpinner size={50} color='white' />
    </View>
  )
}

export default OpenIDConnection
