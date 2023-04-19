import type { StackScreenProps } from '@react-navigation/stack'

import { ProofExchangeRecord } from '@aries-framework/core'
import { useAgent, useProofById } from '@aries-framework/react-hooks'
import { useIsFocused } from '@react-navigation/core'
import { useFocusEffect } from '@react-navigation/native'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BackHandler, DeviceEventEmitter, Dimensions, Share, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import {
  isPresentationFailed,
  isPresentationReceived,
  linkProofWithTemplate,
  createConnectionlessProofRequestInvitation,
} from '../../verifier'
import LoadingIndicator from '../components/animated/LoadingIndicator'
import Button, { ButtonType } from '../components/buttons/Button'
import QRRenderer from '../components/misc/QRRenderer'
import { EventTypes } from '../constants'
import { useTheme } from '../contexts/theme'
import { useTemplate } from '../hooks/proof-request-templates'
import { BifoldError } from '../types/error'
import { ProofRequestsStackParams, Screens } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

type ProofRequestingProps = StackScreenProps<ProofRequestsStackParams, Screens.ProofRequesting>

const windowDimensions = Dimensions.get('window')

const qrContainerSize = windowDimensions.width - 20
const qrSize = qrContainerSize - 60

const ProofRequesting: React.FC<ProofRequestingProps> = ({ route, navigation }) => {
  if (!route?.params) {
    throw new Error('ProofRequesting route prams were not set properly')
  }

  const { templateId, predicateValues } = route?.params

  const { agent } = useAgent()
  if (!agent) {
    throw new Error('Unable to fetch agent from AFJ')
  }

  const { t } = useTranslation()
  const { ColorPallet } = useTheme()
  const isFocused = useIsFocused()

  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: ColorPallet.grayscale.white,
    },
    headerContainer: {
      alignItems: 'center',
      padding: 16,
      marginVertical: 20,
      marginHorizontal: 30,
      textAlign: 'center',
    },
    primaryHeaderText: {
      fontWeight: 'bold',
      fontSize: 28,
      textAlign: 'center',
      color: ColorPallet.grayscale.black,
    },
    secondaryHeaderText: {
      fontWeight: 'normal',
      fontSize: 20,
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
      fontWeight: 'bold',
      fontSize: 22,
      color: ColorPallet.brand.primary,
    },
    qrContainer: {
      width: qrContainerSize,
      height: qrContainerSize,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 10,
      borderColor: ColorPallet.brand.primary,
      borderWidth: 10,
      borderRadius: 40,
    },
    buttonContainer: {
      marginTop: 'auto',
      marginHorizontal: 20,
    },
    footerButton: {
      marginBottom: 10,
    },
  })

  const [generating, setGenerating] = useState(true)
  const [message, setMessage] = useState<string | undefined>(undefined)
  const [invitationUrl, setInvitationUrl] = useState<string | undefined>(undefined)
  const [recordId, setRecordId] = useState<string | undefined>(undefined)

  const template = useTemplate(templateId)
  if (!template) {
    throw new Error('Unable to find proof request template')
  }

  const createProofRequest = useCallback(async () => {
    try {
      setMessage(undefined)
      setGenerating(true)
      const result = await createConnectionlessProofRequestInvitation(agent, template, predicateValues)
      if (result) {
        setRecordId(result.proofRecord.id)
        setMessage(JSON.stringify(result.invitation.toJSON()))
        setInvitationUrl(result.invitationUrl)
        linkProofWithTemplate(agent, result.proofRecord, templateId)
      }
    } catch (e) {
      const error = new BifoldError(t('Error.Title1038'), t('Error.Message1038'), (e as Error).message, 1038)
      DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
      navigation.goBack()
    } finally {
      setGenerating(false)
    }
  }, [])

  const shareLink = useCallback(() => {
    if (invitationUrl && invitationUrl.trim().length > 0) {
      Share.share({
        title: t('ProofRequest.ProofRequest'),
        message: invitationUrl,
      })
    }
  }, [invitationUrl])

  useEffect(() => {
    if (isFocused) {
      createProofRequest()
    }
  }, [isFocused])

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate(Screens.ProofRequests, {})
        return true
      }

      BackHandler.addEventListener('hardwareBackPress', onBackPress)

      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress)
    }, [])
  )

  const record: ProofExchangeRecord | undefined = useProofById(recordId || '')

  useEffect(() => {
    if (record && (isPresentationReceived(record) || isPresentationFailed(record))) {
      navigation.navigate(Screens.ProofDetails, { recordId: record.id })
    }
  }, [record])

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <View style={styles.headerContainer}>
        <Text style={styles.primaryHeaderText}>{t('Verifier.ScanQR')}</Text>
        <Text style={styles.secondaryHeaderText}>{t('Verifier.ScanQRComment')}</Text>
      </View>
      <Text style={styles.interopText}>AIP 2.0</Text>
      <View style={styles.qrContainer}>
        {generating && <LoadingIndicator />}
        {message && <QRRenderer value={message} size={qrSize} />}
      </View>
      <View style={styles.buttonContainer}>
        <View style={styles.footerButton}>
          <Button
            title={t('Verifier.GenerateNewQR')}
            accessibilityLabel={t('Verifier.GenerateNewQR')}
            testID={testIdWithKey('GenerateNewQR')}
            buttonType={ButtonType.Primary}
            onPress={() => createProofRequest()}
            disabled={generating}
          />
        </View>
        <View style={styles.footerButton}>
          <Button
            title={t('Verifier.ShareLink')}
            accessibilityLabel={t('Verifier.ShareLink')}
            testID={testIdWithKey('ShareLink')}
            buttonType={ButtonType.Secondary}
            onPress={() => shareLink()}
            disabled={generating}
          />
        </View>
      </View>
    </SafeAreaView>
  )
}

export default ProofRequesting
