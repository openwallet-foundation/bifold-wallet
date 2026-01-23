import { ProofState } from '@credo-ts/core'
import { useProofById } from '@credo-ts/react-hooks'
import { useNavigation } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import Button, { ButtonType } from '../components/buttons/Button'
import SafeAreaModal from '../components/modals/SafeAreaModal'
import { useAnimatedComponents } from '../contexts/animated-components'
import { useTheme } from '../contexts/theme'
import { Screens, TabStacks } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'
import { ThemedText } from '../components/texts/ThemedText'
import ScreenWrapper from '../components/views/ScreenWrapper'

export interface ProofRequestAcceptProps {
  visible: boolean
  proofId: string
  confirmationOnly?: boolean
}

const ProofRequestAccept: React.FC<ProofRequestAcceptProps> = ({ visible, proofId, confirmationOnly }) => {
  const { t } = useTranslation()
  const [proofDeliveryStatus, setProofDeliveryStatus] = useState<ProofState>(ProofState.RequestReceived)
  const proof = useProofById(proofId)
  const navigation = useNavigation()
  const { TextTheme } = useTheme()
  const { SendingProof, SentProof } = useAnimatedComponents()

  const styles = StyleSheet.create({
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
    delayMessageText: {
      textAlign: 'center',
      marginTop: 20,
    },
  })

  if (!proof && !confirmationOnly) {
    throw new Error('Unable to fetch proof from Credo')
  }

  const onBackToHomeTouched = () => {
    navigation.getParent()?.navigate(TabStacks.HomeStack, { screen: Screens.Home })
  }

  useEffect(() => {
    if (confirmationOnly) {
      setProofDeliveryStatus(ProofState.PresentationSent)
      return
    }

    if (!proof) return

    if (proof.state === proofDeliveryStatus) {
      return
    }

    if (proof.state === ProofState.Done || proof.state === ProofState.PresentationSent) {
      setProofDeliveryStatus(proof.state)
    }
  }, [proof, proofDeliveryStatus, confirmationOnly])

  const controls = (
    <Button
      title={t('Loading.BackToHome')}
      accessibilityLabel={t('Loading.BackToHome')}
      testID={testIdWithKey('BackToHome')}
      onPress={onBackToHomeTouched}
      buttonType={ButtonType.ModalSecondary}
    />
  )

  return (
    <SafeAreaModal visible={visible} transparent={true} animationType={'none'}>
      <ScreenWrapper edges={['bottom', 'top', 'left', 'right']} controls={controls}>
        <View style={styles.messageContainer}>
          {proofDeliveryStatus === ProofState.RequestReceived && (
            <ThemedText
              variant="modalHeadingThree"
              style={styles.messageText}
              testID={testIdWithKey('SendingProofRequest')}
            >
              {t('ProofRequest.SendingTheInformationSecurely')}
            </ThemedText>
          )}

          {(proofDeliveryStatus === ProofState.PresentationSent || proofDeliveryStatus === ProofState.Done) && (
            <ThemedText
              variant="modalHeadingThree"
              style={styles.messageText}
              testID={testIdWithKey('SentProofRequest')}
            >
              {t('ProofRequest.InformationSentSuccessfully')}
            </ThemedText>
          )}
        </View>

        <View style={[styles.image, { minHeight: 250, alignItems: 'center', justifyContent: 'flex-end' }]}>
          {proofDeliveryStatus === ProofState.RequestReceived && <SendingProof />}
          {(proofDeliveryStatus === ProofState.PresentationSent || proofDeliveryStatus === ProofState.Done) && (
            <SentProof />
          )}
        </View>
      </ScreenWrapper>
    </SafeAreaModal>
  )
}

export default ProofRequestAccept
