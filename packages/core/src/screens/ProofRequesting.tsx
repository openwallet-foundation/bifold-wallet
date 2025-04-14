import type { StackScreenProps } from '@react-navigation/stack'

import { DidExchangeState, ProofState } from '@credo-ts/core'
import { useAgent, useProofById } from '@credo-ts/react-hooks'
import { ProofCustomMetadata, ProofMetadata, linkProofWithTemplate, sendProofRequest } from '@bifold/verifier'
import { TOKENS, useServices } from '../container-api'
import { useIsFocused, useFocusEffect } from '@react-navigation/native'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  BackHandler,
  DeviceEventEmitter,
  ScrollView,
  Share,
  StyleSheet,
  Vibration,
  View,
  useWindowDimensions,
} from 'react-native'
import { isTablet } from 'react-native-device-info'
import { SafeAreaView } from 'react-native-safe-area-context'

import LoadingIndicator from '../components/animated/LoadingIndicator'
import Button, { ButtonType } from '../components/buttons/Button'
import IconButton, { ButtonLocation } from '../components/buttons/IconButton'
import QRRenderer from '../components/misc/QRRenderer'
import { EventTypes } from '../constants'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { useConnectionByOutOfBandId } from '../hooks/connections'
import { useTemplate } from '../hooks/proof-request-templates'
import { BifoldError } from '../types/error'
import { ProofRequestsStackParams, Screens } from '../types/navigators'
import { createTempConnectionInvitation } from '../utils/helpers'
import { testIdWithKey } from '../utils/testable'
import { ThemedText } from '../components/texts/ThemedText'

type ProofRequestingProps = StackScreenProps<ProofRequestsStackParams, Screens.ProofRequesting>

const useQrSizeForDevice = () => {
  const { width } = useWindowDimensions()
  const qrContainerSize = isTablet() ? width - width * 0.3 : width - 20
  const qrSize = qrContainerSize - 20

  return { qrSize, qrContainerSize }
}

const ProofRequesting: React.FC<ProofRequestingProps> = ({ route, navigation }) => {
  if (!route?.params) {
    throw new Error('ProofRequesting route params were not set properly')
  }

  const { templateId, predicateValues } = route.params
  const { agent } = useAgent()
  if (!agent) {
    throw new Error('Unable to fetch agent from Credo')
  }

  const { t } = useTranslation()
  const { ColorPallet, TextTheme } = useTheme()
  const isFocused = useIsFocused()
  const [store] = useStore()
  const [generating, setGenerating] = useState(true)
  const [message, setMessage] = useState<string | undefined>(undefined)
  const [connectionRecordId, setConnectionRecordId] = useState<string | undefined>(undefined)
  const [proofRecordId, setProofRecordId] = useState<string | undefined>(undefined)
  const record = useConnectionByOutOfBandId(connectionRecordId ?? '')
  const proofRecord = useProofById(proofRecordId ?? '')
  const template = useTemplate(templateId)
  const { qrSize, qrContainerSize } = useQrSizeForDevice()
  const [logger] = useServices([TOKENS.UTIL_LOGGER])

  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: ColorPallet.grayscale.white,
    },
    headerContainer: {
      alignItems: 'center',
      paddingVertical: 16,
      marginHorizontal: 20,
      textAlign: 'center',
    },
    primaryHeaderText: {
      textAlign: 'center',
      marginTop: 20,
    },
    secondaryHeaderText: {
      textAlign: 'center',
      marginTop: 8,
      color: ColorPallet.grayscale.black,
    },
    interopText: {
      alignSelf: 'center',
      marginBottom: -20,
      paddingHorizontal: 10,
      backgroundColor: ColorPallet.grayscale.white,
      zIndex: 100,
      textAlign: 'center',
      fontWeight: TextTheme.bold.fontWeight,
      fontSize: 22,
      color: ColorPallet.brand.primary,
    },
    qrContainer: {
      height: qrContainerSize,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 10,
      marginTop: 15,
    },
    buttonContainer: {
      marginTop: 'auto',
      marginHorizontal: 20,
      marginBottom: 10,
    },
  })

  const createProofRequest = useCallback(async () => {
    try {
      setMessage(undefined)
      setGenerating(true)

      const result = await createTempConnectionInvitation(agent, 'verify')

      if (result) {
        setConnectionRecordId(result.record.id)
        setMessage(result.invitationUrl)
      }
    } catch (e: unknown) {
      const error = new BifoldError(t('Error.Title1038'), t('Error.Message1038'), (e as Error)?.message ?? e, 1038)

      DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)

      navigation.goBack()
    } finally {
      setGenerating(false)
    }
  }, [agent, t, navigation])

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate(Screens.ProofRequests, {})

        return true
      }

      BackHandler.addEventListener('hardwareBackPress', onBackPress)

      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress)
    }, [navigation])
  )

  useEffect(() => {
    if (message && store.preferences.enableShareableLink) {
      const scanShareUrl = () => (
        <IconButton
          buttonLocation={ButtonLocation.Right}
          accessibilityLabel={t('Global.Share')}
          testID={testIdWithKey('ShareButton')}
          onPress={() => {
            Share.share({ message })
          }}
          icon="share-variant"
        />
      )

      navigation.setOptions({ headerRight: scanShareUrl })
    }
  }, [message, store.preferences.enableShareableLink, t, navigation])

  useEffect(() => {
    if (isFocused) {
      createProofRequest()
    }
  }, [isFocused, createProofRequest])

  useEffect(() => {
    if (!template) {
      return
    }

    const sendAsyncProof = async () => {
      if (record && record.state === DidExchangeState.Completed) {
        //send haptic feedback to verifier that connection is completed
        Vibration.vibrate()

        // send proof logic
        const result = await sendProofRequest(agent, template, record.id, predicateValues)
        if (result?.proofRecord) {
          // verifier side doesn't have access to the goal code so we need to add metadata here
          const metadata = result.proofRecord.metadata.get(ProofMetadata.customMetadata) as ProofCustomMetadata
          result.proofRecord.metadata.set(ProofMetadata.customMetadata, { ...metadata, delete_conn_after_seen: true })
          linkProofWithTemplate(agent, result.proofRecord, templateId)
        }

        setProofRecordId(result?.proofRecord.id)
      }
    }

    sendAsyncProof().catch((err) => {
      logger.error(`Error sending proof request ${err}`)
    })
  }, [template, record, agent, predicateValues, templateId, logger])

  useEffect(() => {
    if (proofRecord && proofRecord.state === ProofState.RequestSent) {
      navigation.navigate(Screens.MobileVerifierLoading, { proofId: proofRecord.id, connectionId: record?.id ?? '' })

      setProofRecordId(undefined)
      setConnectionRecordId(undefined)
      setMessage(undefined)
      setGenerating(true)
    }
  }, [proofRecord, navigation, record?.id])

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <ScrollView>
        <View style={styles.qrContainer}>
          {generating && <LoadingIndicator />}
          {message && <QRRenderer value={message} size={qrSize} />}
        </View>
        <View style={styles.headerContainer}>
          <ThemedText style={styles.secondaryHeaderText}>{t('Verifier.ScanQR')}</ThemedText>
          <ThemedText variant="headingThree" style={styles.primaryHeaderText}>
            {template?.name}
          </ThemedText>
        </View>
      </ScrollView>
      <View style={styles.buttonContainer}>
        <Button
          title={t('Verifier.RefreshQR')}
          accessibilityLabel={t('Verifier.RefreshQR')}
          testID={testIdWithKey('GenerateNewQR')}
          buttonType={ButtonType.Primary}
          onPress={() => createProofRequest()}
          disabled={generating}
        />
      </View>
    </SafeAreaView>
  )
}

export default ProofRequesting
