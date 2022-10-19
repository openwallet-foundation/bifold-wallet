import { useAgent } from '@aries-framework/react-hooks'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, SafeAreaView, Keyboard, StyleSheet, View, Text } from 'react-native'

import Button, { ButtonType } from '../components/buttons/Button'
import PinInput from '../components/inputs/PinInput'
import { useAuth } from '../contexts/auth'
import { useTheme } from '../contexts/theme'
import { hashPIN } from '../utils/crypto'
import { testIdWithKey } from '../utils/testable'

export enum Action {
  Enable = 'enable',
  Disable = 'disable',
}

interface CheckPinProps {
  visible: boolean
  action: Action
  onAuthenticationComplete: (status: boolean) => void
}

const CheckPin: React.FC<CheckPinProps> = ({ visible, action, onAuthenticationComplete }) => {
  const { ColorPallet } = useTheme()
  const { t } = useTranslation()
  const { agent } = useAgent()
  const { getWalletCredentials } = useAuth()
  const [continueEnabled, setContinueEnabled] = useState<boolean>(true)
  const [pin, setPin] = useState<string>()
  const styles = StyleSheet.create({
    container: {
      height: '100%',
      backgroundColor: ColorPallet.brand.primaryBackground,
      padding: 20,
    },
  })

  const unlockWalletWithPIN = async (pin: string): Promise<boolean> => {
    try {
      const credentials = await getWalletCredentials()
      if (!credentials) {
        throw new Error('Problem')
      }

      const key = await hashPIN(pin, credentials.salt)

      if (agent?.wallet.isInitialized ?? false) {
        console.log('closing at ', Date.now())
        await agent?.wallet.close()
        console.log('closed at ', Date.now())
      }

      console.log('opening at ', Date.now())
      await agent?.wallet.open({
        id: credentials.id,
        key,
      })
      console.log('open at ', Date.now())

      return agent?.wallet.isInitialized ?? false
    } catch (error) {
      return false
    }
  }

  const unlockWalletWithCurrentCredentials = async (): Promise<void> => {
    try {
      const credentials = await getWalletCredentials()
      if (!credentials) {
        throw new Error('Problem')
      }

      if (agent?.wallet.isInitialized ?? false) {
        await agent?.wallet.close()
      }

      await agent?.wallet.open({
        id: credentials.id,
        key: credentials.key,
      })
    } catch (error) {
      console.log('************** error: =', (error as Error).message)
    }
  }

  const handleEnterTouched = async () => {
    let pinDidMatch = false

    try {
      setContinueEnabled(false)
      Keyboard.dismiss()

      if (pin && pin.length > 0) {
        pinDidMatch = await unlockWalletWithPIN(pin)
      }
    } catch (error) {
      console.log('************** error: =', (error as Error).message)
    } finally {
      await unlockWalletWithCurrentCredentials()
      onAuthenticationComplete(pinDidMatch)
      setContinueEnabled(true)
    }
  }

  return (
    <Modal visible={visible} transparent={true} animationType={'slide'}>
      <SafeAreaView>
        <View style={styles.container}>
          <Text>This is a placeholder screen. It is not complete.</Text>
          <Text>A new screen will replace this shortly.</Text>

          <View style={{ marginTop: 50 }}></View>
          <Text>Enter your PIN to {action} biometrics.</Text>

          <PinInput
            onPinChanged={setPin}
            testID={testIdWithKey('EnterPIN')}
            accessibilityLabel={t('PinEnter.EnterPIN')}
            autoFocus={true}
          />

          <View style={{ marginTop: 'auto', margin: 20 }}>
            <Button
              title={t('Global.Enter')}
              buttonType={ButtonType.Primary}
              testID={testIdWithKey('Enter')}
              disabled={!continueEnabled}
              accessibilityLabel={t('Global.Enter')}
              onPress={handleEnterTouched}
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  )
}

export default CheckPin
