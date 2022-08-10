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

const connectionTimerDelay = 5000 // in ms

export interface ProofRequestAcceptProps {
  visible: boolean
  proofId: string
}

const ProofRequestAccept: React.FC<ProofRequestAcceptProps> = ({ visible, proofId }) => {
  const { t } = useTranslation()
  const [shouldShowDelayMessage, setShouldShowDelayMessage] = useState<boolean>(false)
  const [proofDeliveryStatus, setProofDeliveryStatus] = useState<ProofState>(ProofState.RequestReceived)
  const [, setTimerDidFire] = useState<boolean>(false)
  const [timer, setTimer] = useState<NodeJS.Timeout>()
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

  const onDoneTouched = () => {
    navigation.getParent()?.navigate(TabStacks.CredentialStack, { screen: Screens.Credentials })
  }

  useEffect(() => {
    if (proof.state === proofDeliveryStatus) {
      return
    }

    if (
      proof.state === ProofState.Done ||
      (proofDeliveryStatus === ProofState.PresentationSent && typeof proof.connectionId === 'undefined')
    ) {
      timer && clearTimeout(timer)
      setProofDeliveryStatus(proof.state)
    }
  }, [proof])

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldShowDelayMessage(true)
      setTimerDidFire(true)
    }, connectionTimerDelay)

    setTimer(timer)

    return () => {
      timer && clearTimeout(timer)
    }
  }, [visible])

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

          {/* No-Connection, transaction completed */}
          {proofDeliveryStatus === ProofState.PresentationSent && (
            <Text style={[TextTheme.headingThree, styles.messageText]} testID={testIdWithKey('SentProofRequest')}>
              {t('ProofRequest.InformationSentSuccessfully')}
            </Text>
          )}

          {/* Connection, transaction completed */}
          {proofDeliveryStatus === ProofState.Done && (
            <Text style={[TextTheme.headingThree, styles.messageText]} testID={testIdWithKey('SentProofRequest')}>
              {t('ProofRequest.ProofRequestCompleted')}
            </Text>
          )}
        </View>

        <View style={[styles.image, { minHeight: 250, alignItems: 'center', justifyContent: 'flex-end' }]}>
          {(proofDeliveryStatus === ProofState.RequestReceived ||
            (proofDeliveryStatus === ProofState.PresentationSent && typeof proof.connectionId !== 'undefined')) && (
            <SendingProof />
          )}
          {((proofDeliveryStatus === ProofState.PresentationSent && typeof proof.connectionId === 'undefined') ||
            proofDeliveryStatus === ProofState.Done) && <SentProof />}
        </View>

        {shouldShowDelayMessage &&
          proofDeliveryStatus === ProofState.PresentationSent &&
          typeof proof.connectionId !== 'undefined' && (
            <Text style={[TextTheme.normal, styles.delayMessageText]} testID={testIdWithKey('TakingTooLong')}>
              {t('Connection.TakingTooLong')}
            </Text>
          )}

        <View style={[styles.controlsContainer]}>
          {shouldShowDelayMessage &&
            proofDeliveryStatus === ProofState.PresentationSent &&
            typeof proof.connectionId !== 'undefined' && (
              <Button
                title={t('Loading.BackToHome')}
                accessibilityLabel={t('Loading.BackToHome')}
                testID={testIdWithKey('BackToHome')}
                onPress={onBackToHomeTouched}
                buttonType={ButtonType.Secondary}
              />
            )}

          {((proofDeliveryStatus === ProofState.PresentationSent && typeof proof.connectionId === 'undefined') ||
            proofDeliveryStatus === ProofState.Done) && (
            <Button
              title={t('Global.Done')}
              accessibilityLabel={t('Global.Done')}
              testID={testIdWithKey('Done')}
              onPress={onDoneTouched}
              buttonType={ButtonType.Primary}
            />
          )}
        </View>
      </SafeAreaView>
    </Modal>
  )
}

export default ProofRequestAccept
