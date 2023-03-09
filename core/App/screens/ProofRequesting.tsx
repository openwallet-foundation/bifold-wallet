import type { StackScreenProps } from '@react-navigation/stack'

import { ProofState } from '@aries-framework/core'
import { useAgent, useProofById } from '@aries-framework/react-hooks'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View, Text, Dimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { createConnectionlessProofRequestInvitation } from '../../verifier/utils/proof-request'
import LoadingIndicator from '../components/animated/LoadingIndicator'
import Button, { ButtonType } from '../components/buttons/Button'
import QRRenderer from '../components/misc/QRRenderer'
import { useTheme } from '../contexts/theme'
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

  const { templateId } = route?.params

  const { agent } = useAgent()

  if (!agent) {
    throw new Error('Unable to fetch agent from AFJ')
  }

  const { t } = useTranslation()
  const { ColorPallet } = useTheme()

  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: ColorPallet.grayscale.white,
    },
    headerContainer: {
      alignItems: 'center',
      paddingHorizontal: 25,
      paddingVertical: 16,
      marginTop: 20,
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
      fontSize: 16,
      textAlign: 'center',
      marginTop: 8,
      color: ColorPallet.grayscale.black,
    },
    qrContainer: {
      width: qrContainerSize,
      height: qrContainerSize,
      alignItems: 'center',
      justifyContent: 'center',
      margin: 10,
      marginTop: 30,
      borderColor: ColorPallet.brand.primary,
      borderWidth: 10,
      borderRadius: 40,
    },
    footerButton: {
      marginTop: 'auto',
      margin: 20,
      marginBottom: 10,
    },
  })

  const [generatingRequest, setGeneratingRequest] = useState(true)
  const [message, setMessage] = useState<string | undefined>(undefined)
  const [recordId, setRecordId] = useState<string | undefined>(undefined)

  const record = recordId ? useProofById(recordId) : undefined

  const createProofRequest = useCallback(async () => {
    try {
      setMessage(undefined)
      setGeneratingRequest(true)
      const result = await createConnectionlessProofRequestInvitation(agent, templateId)
      if (result) {
        setRecordId(result.proofRecord.id)
        setMessage(JSON.stringify(result.invitation.toJSON()))
      }
    } finally {
      setGeneratingRequest(false)
    }
  }, [agent, templateId])

  useEffect(() => {
    createProofRequest()
  }, [createProofRequest])

  useEffect(() => {
    if (record && (record.state === ProofState.PresentationReceived || record.state === ProofState.Done)) {
      navigation.navigate(Screens.ProofDetails, { recordId: record.id })
    }
  }, [record])

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <View style={styles.headerContainer}>
        <Text style={styles.primaryHeaderText}>{t('Verifier.ScanQR')}</Text>
        <Text style={styles.secondaryHeaderText}>{t('Verifier.ScanQRComment')}</Text>
      </View>
      <View style={styles.qrContainer}>
        {generatingRequest && <LoadingIndicator />}
        {message && <QRRenderer value={message} size={qrSize} />}
      </View>
      <View style={styles.footerButton}>
        <Button
          title={t('Verifier.GenerateNewQR')}
          accessibilityLabel={t('Verifier.GenerateNewQR')}
          testID={testIdWithKey('GenerateNewQR')}
          buttonType={ButtonType.Primary}
          onPress={() => createProofRequest()}
          disabled={generatingRequest}
        />
      </View>
    </SafeAreaView>
  )
}

export default ProofRequesting
