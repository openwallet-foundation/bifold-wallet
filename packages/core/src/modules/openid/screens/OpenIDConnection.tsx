import {
  MdocRecord,
  SdJwtVcRecord,
  W3cCredentialRecord,
  BasicMessageRecord,
  CredentialExchangeRecord,
  ProofExchangeRecord
} from '@credo-ts/core'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useEffect, useState } from 'react'
import { BackHandler, View, StyleSheet, DeviceEventEmitter } from 'react-native'

import { useConnectionByOutOfBandId, useOutOfBandById } from '../../../hooks/connections'
import { DeliveryStackParams, Screens } from '../../../types/navigators'
import { useServices, TOKENS } from '../../../container-api'
import { OpenId4VPRequestRecord } from '../../../modules/openid/types'
import { useAppAgent } from '../../../utils/agent'
import LoadingSpinner from '../../../components/animated/LoadingSpinner'
import { EventTypes } from '../../../constants'
import FullScreenErrorModal from '../../../components/modals/FullScreenErrorModal'
import { TabStacks } from '../../../types/navigators'
import { BifoldError } from '../../../types/error'
import { useTheme } from '../../../contexts/theme'


type NotCustomNotification = BasicMessageRecord | CredentialExchangeRecord | ProofExchangeRecord

type ConnectionProps = StackScreenProps<DeliveryStackParams, Screens.OpenIDConnection>

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
  const { ColorPalette } = useTheme()

  const [notificationRecord, setNotificationRecord] = useState<any>(undefined)

  const [showErrorModal, setShowErrorModal] = useState<boolean>(false)
  const [errorDetails, setErrorDetails] = useState<Partial<BifoldError>>({})

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
  }, [agent, historyEnabled, logger])

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

        setNotificationRecord(notification)
        break
      }

      if (
        (notification as W3cCredentialRecord).type === 'W3cCredentialRecord' ||
        (notification as SdJwtVcRecord).type === 'SdJwtVcRecord' ||
        (notification as MdocRecord).type === 'MdocRecord' ||
        (notification as OpenId4VPRequestRecord).type === 'OpenId4VPRequestRecord'
      ) {
        setNotificationRecord(notification)
        break
      }
    }
  }, [notificationRecord, notifications, logger, connection, oobRecord])

  useEffect(() => {

    if (!notificationRecord) {
      return
    }

    if (
      (notificationRecord as W3cCredentialRecord).type === 'W3cCredentialRecord' ||
      (notificationRecord as SdJwtVcRecord).type === 'SdJwtVcRecord' ||
      (notificationRecord as MdocRecord).type === 'MdocRecord'
    ) {
      logger?.info(`Connection: Handling OpenID4VCi Credential, navigate to CredentialOffer`)
      navigation.replace(Screens.OpenIDCredentialOffer, {
        credential: notificationRecord,
      })
      return
    }

    if ((notificationRecord as OpenId4VPRequestRecord).type === 'OpenId4VPRequestRecord') {
      navigation.replace(Screens.OpenIDProofPresentation, { credential: notificationRecord })
    }

  }, [logger, navigation, notificationRecord])

  useEffect(() => {
    const handler = DeviceEventEmitter.addListener(EventTypes.OPENID_CONNECTION_ERROR, (err: BifoldError) => {
      setShowErrorModal(true)
      setErrorDetails({
        ...err
      })
    })
    return () => {
      handler.remove()
    }
  }, [])

  return (
    <>
      <View style={styles.pageContainer}>
        <LoadingSpinner size={50} color={ColorPalette.brand.primary} />
      </View>
      <FullScreenErrorModal 
        errorTitle={errorDetails?.title ?? ''}
        errorDescription={errorDetails?.description ?? ''}
        visible={showErrorModal}
        onPressCTA={() => {
          navigation.getParent()?.navigate(TabStacks.HomeStack, { screen: Screens.Home })
        }}
      />
    </>
  )
}

export default OpenIDConnection
