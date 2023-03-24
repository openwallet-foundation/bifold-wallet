import type { StackScreenProps } from '@react-navigation/stack'

import { ProofExchangeRecord } from '@aries-framework/core'
import { useAgent, useProofById } from '@aries-framework/react-hooks'
import { useNavigation } from '@react-navigation/core'
import { useFocusEffect } from '@react-navigation/native'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions, Share, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { isPresentationFailed, isPresentationReceived, linkProofWithTemplate } from '../../verifier/utils/proof'
import { createConnectionlessProofRequestInvitation } from '../../verifier/utils/proof-request'
import LoadingIndicator from '../components/animated/LoadingIndicator'
import SendingProof from '../components/animated/SendingProof'
import Button, { ButtonType } from '../components/buttons/Button'
import QRRenderer from '../components/misc/QRRenderer'
import { useTheme } from '../contexts/theme'
import { ProofRequestsStackParams, Screens, TabStacks } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

type ProofRequestingProps = StackScreenProps<ProofRequestsStackParams, Screens.ProofRequesting>

const windowDimensions = Dimensions.get('window')

const qrContainerSize = windowDimensions.width - 20
const qrSize = qrContainerSize - 60

// Remove ignore rule once related logic will be enabled
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ProcessingView: React.FC = () => {
  const navigation = useNavigation()
  const { t } = useTranslation()
  const { TextTheme, ColorPallet } = useTheme()
  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: ColorPallet.grayscale.white,
      paddingVertical: 20,
    },
    messageContainer: {
      alignItems: 'center',
    },
    messageText: {
      fontWeight: 'normal',
      textAlign: 'center',
      marginTop: 30,
      color: ColorPallet.grayscale.black,
    },
    controlsContainer: {
      marginTop: 'auto',
      margin: 20,
    },
    loaderContainer: {
      marginTop: 20,
    },
  })

  const onBackToHomeTouched = () => {
    navigation.getParent()?.navigate(TabStacks.HomeStack, { screen: Screens.Home })
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        <View style={styles.messageContainer}>
          <Text style={[TextTheme.headingThree, styles.messageText]} testID={testIdWithKey('SendingProofRequest')}>
            {t('ProofRequest.RequestProcessing')}
          </Text>
        </View>
        <View style={[styles.loaderContainer]}>
          <SendingProof />
        </View>
        <View style={[styles.controlsContainer]}>
          <Button
            title={t('Loading.BackToHome')}
            accessibilityLabel={t('Loading.BackToHome')}
            testID={testIdWithKey('BackToHome')}
            onPress={() => onBackToHomeTouched()}
            buttonType={ButtonType.Secondary}
          />
        </View>
      </View>
    </SafeAreaView>
  )
}

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
  const [invitationUrl, setInitationUrl] = useState<string | undefined>(undefined)
  const [recordId, setRecordId] = useState<string | undefined>(undefined)

  const createProofRequest = useCallback(async () => {
    try {
      setMessage(undefined)
      setGenerating(true)
      const result = await createConnectionlessProofRequestInvitation(agent, templateId, predicateValues)
      if (result) {
        setRecordId(result.proofRecord.id)
        setMessage(JSON.stringify(result.invitation.toJSON()))
        setInitationUrl(result.invitationUrl)
        linkProofWithTemplate(agent, result.proofRecord, templateId)
      }
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

  useFocusEffect(
    useCallback(() => {
      createProofRequest()
    }, [])
  )

  const record: ProofExchangeRecord | undefined = useProofById(recordId || '')

  useEffect(() => {
    if (record && (isPresentationReceived(record) || isPresentationFailed(record))) {
      navigation.navigate(Screens.ProofDetails, { recordId: record.id })
    }
  }, [record])

  // uncomment once processing state for proof record will be added in AFJ
  // if (record?.state === ProofState.PresentationProcessing) return <ProcessingView />

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
            title={t('Verifier.ShareLink')}
            accessibilityLabel={t('Verifier.ShareLink')}
            testID={testIdWithKey('ShareLink')}
            buttonType={ButtonType.Secondary}
            onPress={() => shareLink()}
            disabled={generating}
          />
        </View>
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
      </View>
    </SafeAreaView>
  )
}

export default ProofRequesting
