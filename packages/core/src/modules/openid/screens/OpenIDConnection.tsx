import { StackScreenProps } from '@react-navigation/stack'
import React, { useEffect, useState } from 'react'
import { BackHandler, View, StyleSheet, DeviceEventEmitter } from 'react-native'

import { DeliveryStackParams, Screens } from '../../../types/navigators'
import { useServices, TOKENS } from '../../../container-api'
import LoadingSpinner from '../../../components/animated/LoadingSpinner'
import { EventTypes } from '../../../constants'
import FullScreenErrorModal from '../../../components/modals/FullScreenErrorModal'
import { TabStacks } from '../../../types/navigators'
import { BifoldError } from '../../../types/error'
import { useTheme } from '../../../contexts/theme'
import { useOpenID } from '../hooks/openid'
import { isOpenIDCredentialRecord, isOpenIdProofRequestRecord } from '../credentialRecord'

type ConnectionProps = StackScreenProps<DeliveryStackParams, Screens.OpenIDConnection>

const OpenIDConnection: React.FC<ConnectionProps> = ({ navigation, route }) => {
  const { openIDUri, openIDPresentationUri } = route.params
  const [logger, historyEnabled] = useServices([TOKENS.UTIL_LOGGER, TOKENS.HISTORY_ENABLED])
  const { ColorPalette } = useTheme()
  const notificationRecord = useOpenID({ openIDUri, openIDPresentationUri })

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
      if (!historyEnabled) {
        logger.trace(
          `[${Screens.OpenIDConnection}]:[logHistoryRecord] Skipping history log, either history function disabled or agent undefined!`
        )
        return
      }
    } catch (err: unknown) {
      logger.error(`[${Screens.OpenIDConnection}]:[logHistoryRecord] Error saving history: ${err}`)
    }
  }, [historyEnabled, logger])

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true)
    return () => backHandler.remove()
  }, [])

  useEffect(() => {
    if (!notificationRecord) {
      return
    }

    if (isOpenIDCredentialRecord(notificationRecord)) {
      logger?.info(`Connection: Handling OpenID4VCi Credential, navigate to CredentialOffer`)
      navigation.replace(Screens.OpenIDCredentialOffer, {
        credential: notificationRecord,
      })
      return
    }

    if (isOpenIdProofRequestRecord(notificationRecord)) {
      navigation.replace(Screens.OpenIDProofPresentation, { credential: notificationRecord })
    }
  }, [logger, navigation, notificationRecord])

  useEffect(() => {
    const handler = DeviceEventEmitter.addListener(EventTypes.OPENID_CONNECTION_ERROR, (err: BifoldError) => {
      setShowErrorModal(true)
      setErrorDetails({
        ...err,
      })
    })
    return () => {
      handler.remove()
    }
  }, [])

  return (
    <>
      <View style={styles.pageContainer}>
        <LoadingSpinner color={ColorPalette.brand.loadingIcon} name='loading' />
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
