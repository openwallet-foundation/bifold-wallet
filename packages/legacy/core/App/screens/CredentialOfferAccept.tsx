import { CredentialState } from '@aries-framework/core'
import { useCredentialById } from '@aries-framework/react-hooks'
import { useNavigation } from '@react-navigation/core'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Modal, StatusBar, StyleSheet, Text, View, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import Button, { ButtonType } from '../components/buttons/Button'
import { useAnimatedComponents } from '../contexts/animated-components'
import { useConfiguration } from '../contexts/configuration'
import { useTheme } from '../contexts/theme'
import { Screens, TabStacks } from '../types/navigators'
import { statusBarStyleForColor, StatusBarStyles } from '../utils/luminance'
import { testIdWithKey } from '../utils/testable'

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
  const { CredentialAdded, CredentialPending } = useAnimatedComponents()
  const { connectionTimerDelay } = useConfiguration()
  const connTimerDelay = connectionTimerDelay ?? 10000 // in ms
  const styles = StyleSheet.create({
    container: {
      ...ListItems.credentialOfferBackground,
      height: '100%',
      padding: 20,
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
      marginTop: 30,
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
    if (timerDidFire || credentialDeliveryStatus !== DeliveryStatus.Pending || !visible) {
      return
    }

    const timer = setTimeout(() => {
      setShouldShowDelayMessage(true)
      setTimerDidFire(true)
    }, connTimerDelay)

    setTimer(timer)

    return () => {
      timer && clearTimeout(timer)
    }
  }, [visible])

  return (
    <Modal visible={visible} transparent={true} animationType={'none'}>
      <SafeAreaView style={{ ...ListItems.credentialOfferBackground }}>
        <StatusBar
          barStyle={
            Platform.OS === 'android' ? StatusBarStyles.Light : statusBarStyleForColor(styles.container.backgroundColor)
          }
        />
        <ScrollView style={[styles.container]}>
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
        </ScrollView>

        <View style={[styles.controlsContainer]}>
          {credentialDeliveryStatus === DeliveryStatus.Pending && (
            <View>
              <Button
                title={t('Loading.BackToHome')}
                accessibilityLabel={t('Loading.BackToHome')}
                testID={testIdWithKey('BackToHome')}
                onPress={onBackToHomeTouched}
                buttonType={ButtonType.ModalSecondary}
              />
            </View>
          )}

          {credentialDeliveryStatus === DeliveryStatus.Completed && (
            <View>
              <Button
                title={t('Global.Done')}
                accessibilityLabel={t('Global.Done')}
                testID={testIdWithKey('Done')}
                onPress={onDoneTouched}
                buttonType={ButtonType.ModalPrimary}
              />
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  )
}

export default CredentialOfferAccept
