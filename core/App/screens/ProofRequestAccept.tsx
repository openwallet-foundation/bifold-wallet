import { ProofState } from '@aries-framework/core'
import { useProofById } from '@aries-framework/react-hooks'
import { useNavigation } from '@react-navigation/core'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native'
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

const ProofDeliveryStatusView: React.FC<{ status: ProofState }> = ({ status }) => {
  const { t } = useTranslation()
  const { TextTheme } = useTheme()

  const styles = StyleSheet.create({
    image: {
      marginTop: 20,
    },
    messageContainer: {
      alignItems: 'center',
    },
    messageText: {
      fontWeight: 'normal',
      textAlign: 'center',
      marginTop: 30,
    },
    delayMessageText: {
      textAlign: 'center',
      marginTop: 20,
    },
  })

  switch (status) {
    case ProofState.RequestReceived:
      return (
        <>
          <View style={[styles.messageContainer]}>
            <Text style={[TextTheme.headingThree, styles.messageText]} testID={testIdWithKey('SendingProofRequest')}>
              {t('ProofRequest.SendingTheInformationSecurely')}
            </Text>
          </View>
          <View style={[styles.image, { minHeight: 250, alignItems: 'center', justifyContent: 'flex-end' }]}>
            <SendingProof />
          </View>
        </>
      )
    case ProofState.PresentationSent:
    case ProofState.Done:
      return (
        <>
          <View style={[styles.messageContainer]}>
            <Text style={[TextTheme.headingThree, styles.messageText]} testID={testIdWithKey('SentProofRequest')}>
              {t('ProofRequest.InformationSentSuccessfully')}
            </Text>
          </View>
          <View style={[styles.image, { minHeight: 250, alignItems: 'center', justifyContent: 'flex-end' }]}>
            <SentProof />
          </View>
        </>
      )
    default:
      return null
  }
}

const ProofRequestAccept: React.FC<ProofRequestAcceptProps> = ({ visible, proofId }) => {
  const { t } = useTranslation()
  const [proofDeliveryStatus, setProofDeliveryStatus] = useState<ProofState>(ProofState.RequestReceived)
  const proof = useProofById(proofId)
  const navigation = useNavigation()
  const { ColorPallet } = useTheme()

  const styles = StyleSheet.create({
    container: {
      height: '100%',
      backgroundColor: ColorPallet.brand.primaryBackground,
      padding: 20,
    },
    controlsContainer: {
      marginTop: 'auto',
      margin: 20,
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
      <SafeAreaView style={{ backgroundColor: ColorPallet.brand.primaryBackground }}>
        <ScrollView style={[styles.container]}>
          <ProofDeliveryStatusView status={proof.state} />
        </ScrollView>

        <View style={[styles.controlsContainer]}>
          <View>
            <Button
              title={t('Loading.BackToHome')}
              accessibilityLabel={t('Loading.BackToHome')}
              testID={testIdWithKey('BackToHome')}
              onPress={onBackToHomeTouched}
              buttonType={ButtonType.Secondary}
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  )
}

export default ProofRequestAccept
