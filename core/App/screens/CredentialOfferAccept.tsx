import { CredentialState } from '@aries-framework/core'
import { useCredentialById } from '@aries-framework/react-hooks'
import { useNavigation } from '@react-navigation/core'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import CredentialAdded from '../components/animated/CredentialAdded'
import CredentialPending from '../components/animated/CredentialPending'
import Button, { ButtonType } from '../components/buttons/Button'
import { useTheme } from '../contexts/theme'
import { Screens, TabStacks } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

const connectionTimerDelay = 5000 // in ms

enum DeliveryStatus {
  Pending,
  Completed,
  Declined,
}

export interface CredentialOfferAcceptProps {
  visible: boolean
  credentialId: string
}

const CredentialOfferAccept: React.FC<CredentialOfferAcceptProps> = ({ visible, credentialId }) => {
  const { t } = useTranslation()
  const [shouldShowDelayMessage, setShouldShowDelayMessage] = useState<boolean>(false)
  const [credentialDeliveryStatus, setCredentialDeliveryStatus] = useState<DeliveryStatus>(DeliveryStatus.Pending)
  const [timerDidFire, setTimerDidFire] = useState<boolean>(false)
  const [timer, setTimer] = useState<NodeJS.Timeout>()
  const credential = useCredentialById(credentialId)
  const navigation = useNavigation()
  const { ListItems } = useTheme()
  const imageDisplayOptions = {
    fill: ListItems.credentialIconColor.color,
    height: 250,
    width: 250,
  }
  const styles = StyleSheet.create({
    container: {
      ...ListItems.credentialOfferBackground,
      flexGrow: 1,
      flexDirection: 'column',
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

  if (!credential) {
    throw new Error('Unable to fetch credential from AFJ')
  }

  const onBackToHomeTouched = () => {
    navigation.getParent()?.navigate(TabStacks.HomeStack, { screen: Screens.Home })
  }

  const onDoneTouched = () => {
    navigation.getParent()?.navigate(TabStacks.CredentialStack, { screen: Screens.Credentials })
  }

  useEffect(() => {
    if (credential.state === CredentialState.CredentialReceived || credential.state === CredentialState.Done) {
      timer && clearTimeout(timer)
      setCredentialDeliveryStatus(DeliveryStatus.Completed)
    }
  }, [credential])

  useEffect(() => {
    if ((timerDidFire || credentialDeliveryStatus !== DeliveryStatus.Pending) && !visible) {
      return
    }

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
      <SafeAreaView style={[styles.container]}>
        <View style={[styles.messageContainer]}>
          {credentialDeliveryStatus === DeliveryStatus.Pending && (
            <Text
              style={[ListItems.credentialOfferTitle, styles.messageText]}
              testID={testIdWithKey('CredentialOnTheWay')}
            >
              {t('CredentialOffer.CredentialOnTheWay')}
            </Text>
          )}

          {credentialDeliveryStatus === DeliveryStatus.Completed && (
            <Text
              style={[ListItems.credentialOfferTitle, styles.messageText]}
              testID={testIdWithKey('CredentialAddedToYourWallet')}
            >
              {t('CredentialOffer.CredentialAddedToYourWallet')}
            </Text>
          )}
        </View>

        <View style={[styles.image, { minHeight: 250, alignItems: 'center', justifyContent: 'flex-end' }]}>
          {credentialDeliveryStatus === DeliveryStatus.Completed && <CredentialAdded />}
          {credentialDeliveryStatus === DeliveryStatus.Pending && <CredentialPending />}
        </View>

        {shouldShowDelayMessage && credentialDeliveryStatus === DeliveryStatus.Pending && (
          <Text
            style={[ListItems.credentialOfferDetails, styles.delayMessageText]}
            testID={testIdWithKey('TakingTooLong')}
          >
            {t('Connection.TakingTooLong')}
          </Text>
        )}

        <View style={[styles.controlsContainer]}>
          {shouldShowDelayMessage && credentialDeliveryStatus === DeliveryStatus.Pending && (
            <Button
              title={t('Loading.BackToHome')}
              accessibilityLabel={t('Loading.BackToHome')}
              testID={testIdWithKey('BackToHome')}
              onPress={onBackToHomeTouched}
              buttonType={ButtonType.Secondary}
            />
          )}

          {credentialDeliveryStatus === DeliveryStatus.Completed && (
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

export default CredentialOfferAccept
