import { ProofState } from '@aries-framework/core'
import { useProofById } from '@aries-framework/react-hooks'
import { useNavigation } from '@react-navigation/core'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Modal, StatusBar, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import SendingProof from '../components/animated/SendingProof'
import SentProof from '../components/animated/SentProof'
import Button, { ButtonType } from '../components/buttons/Button'
import { useTheme } from '../contexts/theme'
import { Screens, TabStacks } from '../types/navigators'
import { statusBarStyleForColor, StatusBarStyles } from '../utils/luminance'
import { testIdWithKey } from '../utils/testable'

export interface ProofRequestAcceptProps {
  visible: boolean
  proofId: string
}

const ProofRequestAccept: React.FC<ProofRequestAcceptProps> = ({ visible, proofId }) => {
  const { t } = useTranslation()
  const [proofDeliveryStatus, setProofDeliveryStatus] = useState<ProofState>(ProofState.RequestReceived)
  const proof = useProofById(proofId)
  const navigation = useNavigation()
  const { ColorPallet, TextTheme } = useTheme()

  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      flexDirection: 'column',
      backgroundColor: ColorPallet.brand.primaryBackground,
      paddingHorizontal: 25,
      paddingTop: 20,
    },
    image: {
      marginTop: 20,
    },
    messageContainer: {
      alignItems: 'center',
    },
    messageText: {
      fontWeight: 'normal',
      textAlign: 'center',
      marginTop: 90,
    },
    controlsContainer: {
      marginTop: 'auto',
      marginBottom: 20,
    },
    delayMessageText: {
      textAlign: 'center',
      marginTop: 20,
    },
  })

  if (!proof) {
    throw new Error('Unable to fetch proof from AFJ')
  }

  const onBackToHomeTouched = () => {
    navigation.getParent()?.navigate(TabStacks.HomeStack, { screen: Screens.Home })
  }

  useEffect(() => {
    if (proof.state === proofDeliveryStatus) {
      return
    }

    if (proof.state === ProofState.Done || proof.state === ProofState.PresentationSent) {
      setProofDeliveryStatus(proof.state)
    }
  }, [proof])

  return (
    <Modal visible={visible} transparent={true} animationType={'none'}>
      <StatusBar
        barStyle={
          Platform.OS === 'android' ? StatusBarStyles.Light : statusBarStyleForColor(styles.container.backgroundColor)
        }
      />
      <SafeAreaView style={[styles.container]}>
        <View style={[styles.messageContainer]}>
          {proofDeliveryStatus === ProofState.RequestReceived && (
            <Text style={[TextTheme.headingThree, styles.messageText]} testID={testIdWithKey('SendingProofRequest')}>
              {t('ProofRequest.SendingTheInformationSecurely')}
            </Text>
          )}

          {(proofDeliveryStatus === ProofState.PresentationSent || proofDeliveryStatus === ProofState.Done) && (
            <Text style={[TextTheme.headingThree, styles.messageText]} testID={testIdWithKey('SentProofRequest')}>
              {t('ProofRequest.InformationSentSuccessfully')}
            </Text>
          )}
        </View>

        <View style={[styles.image, { minHeight: 250, alignItems: 'center', justifyContent: 'flex-end' }]}>
          {proofDeliveryStatus === ProofState.RequestReceived && <SendingProof />}
          {proofDeliveryStatus === ProofState.PresentationSent && <SentProof />}
        </View>

        <View style={[styles.controlsContainer]}>
          <Button
            title={t('Loading.BackToHome')}
            accessibilityLabel={t('Loading.BackToHome')}
            testID={testIdWithKey('BackToHome')}
            onPress={onBackToHomeTouched}
            buttonType={ButtonType.Secondary}
          />
        </View>
      </SafeAreaView>
    </Modal>
  )
}

export default ProofRequestAccept
