import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard, StyleSheet, Text, Image, View, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import Button, { ButtonType } from '../components/buttons/Button'
import PinInput from '../components/inputs/PinInput'
import AlertModal from '../components/modals/AlertModal'
import { useAuth } from '../contexts/auth'
import { useTheme } from '../contexts/theme'
import { generateKeyForPin, getWalletKey } from '../services/keychain.service'
import { AuthLevel, WalletSecret } from '../types/security'
import { testIdWithKey } from '../utils/testable'

interface PinEnterProps {
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
  checkPIN: (pin: string) => Promise<boolean>
}

const PinEnter: React.FC<PinEnterProps> = ({ setAuthenticated, checkPIN }) => {
  const { t } = useTranslation()
  const { getWalletSecret, getKeyForPIN } = useAuth()
  const [walletSecret, setWalletSecret] = useState<WalletSecret>()
  const [pin, setPin] = useState('')
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [authLevel, setAuthLevel] = useState<AuthLevel>(AuthLevel.BiometricsFallbackPin)
  //Flags for protecting flow
  const [isInitializingSecret, setIsInitializingSecret] = useState(false)

  const { ColorPallet, TextTheme, Assets } = useTheme()
  const style = StyleSheet.create({
    container: {
      backgroundColor: ColorPallet.brand.primaryBackground,
    },
  })

  const onPinChanged = async (pin: string) => {
    if (authLevel === AuthLevel.BiometricsAndPin) {
      if (walletSecret) {
        const generatedKey = await getKeyForPIN(pin)
        if (generatedKey === walletSecret.walletKey) {
          setAuthenticated(true)
        } else {
          setModalVisible(true)
        }
      } else {
        //TODO: Error handling
        Alert.alert('Error: Wallet secret undefined!.\nPlease reload the app')
      }
      const keyForPIN = await generateKeyForPin(pin)
    } else {
      //Fallback to PIN, attempt to init wallet with generated key
      const isError = await checkPIN(pin)

      if (isError) {
        setModalVisible(true)
        return
      } else {
        setAuthenticated(true)
      }
    }
  }

  const initWithBiometrics = async () => {
    //TODO: get auth level from settings
    // const authLevel = await getAuthLevel()
    try {
      const fetchedWalletSecret = await getWalletSecret()
      if (fetchedWalletSecret) {
        // eslint-disable-next-line no-empty
        if (authLevel === AuthLevel.BiometricsAndPin) {
          setWalletSecret(fetchedWalletSecret)
        } else {
          setAuthenticated(true)
        }
      } else {
        Alert.alert('Error[63] fetching wllet secret')
      }
    } catch (error: any) {
      const msg =
        authLevel === AuthLevel.BiometricsAndPin
          ? 'You have to enable biometrics to be able to load the wallet'
          : 'Biometrics not provided, you may use PIN to load the wallet'
      Alert.alert(msg)
    }
  }

  //This will try to get keys and will trigger biometrics
  useEffect(() => {
    if (!isInitializingSecret) return
    initWithBiometrics()
  }, [isInitializingSecret])

  //This will try to get keys and will trigger biometrics
  useEffect(() => {
    if (!isInitializingSecret) {
      setIsInitializingSecret(true)
    }
  }, [])

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
        <PinInput onPinChanged={setPin} testID="EnterPIN" autoFocus={true} />
        <Button
          title={t('Global.Enter')}
          buttonType={ButtonType.Primary}
          testID={testIdWithKey('Enter')}
          accessibilityLabel={t('Global.Enter')}
          onPress={() => {
            Keyboard.dismiss()
            onPinChanged(pin)
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
