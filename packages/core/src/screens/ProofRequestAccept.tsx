import { DidCommProofState } from '@credo-ts/didcomm'
import { useProofById } from '@credo-ts/react-hooks'
import { useNavigation } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import Button, { ButtonType } from '../components/buttons/Button'
import SafeAreaModal from '../components/modals/SafeAreaModal'
import { useAnimatedComponents } from '../contexts/animated-components'
import { useTheme } from '../contexts/theme'
import { Screens, TabStacks } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'
import { ThemedText } from '../components/texts/ThemedText'

export interface ProofRequestAcceptProps {
  visible: boolean
  proofId: string
  confirmationOnly?: boolean
}

const ProofRequestAccept: React.FC<ProofRequestAcceptProps> = ({ visible, proofId, confirmationOnly }) => {
  const { t } = useTranslation()
  const [proofDeliveryStatus, setProofDeliveryStatus] = useState<DidCommProofState>(DidCommProofState.RequestReceived)
  const proof = useProofById(proofId)
  const navigation = useNavigation()
  const { ColorPalette, TextTheme } = useTheme()
  const { SendingProof, SentProof } = useAnimatedComponents()

  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: ColorPalette.brand.modalPrimaryBackground,
      padding: 20,
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
      margin: 20,
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
      setProofDeliveryStatus(DidCommProofState.PresentationSent)
      return
    }

    if (!proof) return

    if (proof.state === proofDeliveryStatus) {
      return
    }

    if (proof.state === DidCommProofState.Done || proof.state === DidCommProofState.PresentationSent) {
      setProofDeliveryStatus(proof.state)
    }
  }, [proof, proofDeliveryStatus, confirmationOnly])

  return (
    <SafeAreaModal visible={visible} transparent={true} animationType={'none'}>
      <SafeAreaView style={{ flex: 1, backgroundColor: ColorPalette.brand.modalPrimaryBackground }} edges={['top', 'left', 'right', 'bottom']}>
        <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.messageContainer}>
            {proofDeliveryStatus === DidCommProofState.RequestReceived && (
              <ThemedText
                variant="modalHeadingThree"
                style={styles.messageText}
                testID={testIdWithKey('SendingProofRequest')}
              >
                {t('ProofRequest.SendingTheInformationSecurely')}
              </ThemedText>
            )}

            {(proofDeliveryStatus === DidCommProofState.PresentationSent || proofDeliveryStatus === DidCommProofState.Done) && (
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
            {proofDeliveryStatus === DidCommProofState.RequestReceived && <SendingProof />}
            {(proofDeliveryStatus === DidCommProofState.PresentationSent || proofDeliveryStatus === DidCommProofState.Done) && (
              <SentProof />
            )}
          </View>

          <View style={{ flex: 1 }} />

          <View style={styles.controlsContainer}>
            <View>
              <Button
                title={t('Loading.BackToHome')}
                accessibilityLabel={t('Loading.BackToHome')}
                testID={testIdWithKey('BackToHome')}
                onPress={onBackToHomeTouched}
                buttonType={ButtonType.ModalSecondary}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaModal>
  )
}

export default ProofRequestAccept
