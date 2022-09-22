import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard, StyleSheet, Text, Image, View, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import Button, { ButtonType } from '../components/buttons/Button'
import PinInput from '../components/inputs/PinInput'
import AlertModal from '../components/modals/AlertModal'
import { useAuth } from '../contexts/auth'
import { useTheme } from '../contexts/theme'
import { generateKeyForPIN } from '../services/keychain.service'
import { AuthLevel, WalletSecret } from '../types/security'
import { testIdWithKey } from '../utils/testable'

interface PinEnterProps {
}

const PinEnter: React.FC<PinEnterProps> = () => {
  const { t } = useTranslation()
  const { checkPIN, setAuthenticated } = useAuth()
  const [walletSecret, setWalletSecret] = useState<WalletSecret>()
  const [pin, setPin] = useState('')
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [authLevel] = useState<AuthLevel>(AuthLevel.BiometricsFallbackPin)
  // Flags for protecting flow
  const [isInitializingSecret, setIsInitializingSecret] = useState(false)

  const { ColorPallet, TextTheme, Assets } = useTheme()
  const style = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: ColorPallet.brand.primaryBackground,
    },
  })

  const onPinInputCompleted = async (pin: string) => {
    try {
      const result = await checkPIN(pin)
      if (!result) {
        setModalVisible(true)
        return
      }
      setAuthenticated(true)
      return
    } catch (error: unknown) {
      // TODO:(jl) process error
    }
  }

  return (
    <SafeAreaView style={[style.container]}>
      <View style={{ margin: 20 }}>
        <Image
          source={Assets.img.logoLarge.src}
          style={{
            height: Assets.img.logoLarge.height,
            width: Assets.img.logoLarge.width,
            resizeMode: Assets.img.logoLarge.resizeMode,
            alignSelf: 'center',
            marginBottom: 20,
          }}
        />
        <Text style={[TextTheme.normal, { alignSelf: 'center', marginBottom: 16 }]}>{t('PinEnter.EnterPIN')}</Text>
        <PinInput
          onPinChanged={setPin}
          testID={testIdWithKey('EnterPIN')}
          accessibilityLabel={t('PinEnter.EnterPIN')}
          autoFocus={true}
        />
        <Button
          title={t('Global.Enter')}
          buttonType={ButtonType.Primary}
          testID={testIdWithKey('Enter')}
          accessibilityLabel={t('Global.Enter')}
          onPress={() => {
            Keyboard.dismiss()
            onPinInputCompleted(pin)
          }}
        />
      </View>

      {modalVisible && (
        <AlertModal title={t('PinEnter.IncorrectPIN')} message="" submit={() => setModalVisible(false)} />
      )}
    </SafeAreaView>
  )
}

export default PinEnter