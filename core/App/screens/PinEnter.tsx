import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard, StyleSheet, Text, Image, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import Button, { ButtonType } from '../components/buttons/Button'
import PinInput from '../components/inputs/PinInput'
import AlertModal from '../components/modals/AlertModal'
import { useTheme } from '../contexts/theme'
import { generateKeyForPin, getWalletKey } from '../services/keychain.service'
import { testIdWithKey } from '../utils/testable'

interface PinEnterProps {
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
}

const PinEnter: React.FC<PinEnterProps> = ({ setAuthenticated }) => {
  const { t } = useTranslation()
  const [pin, setPin] = useState('')
  const [modalVisible, setModalVisible] = useState<boolean>(false)

  const { ColorPallet, TextTheme, Assets } = useTheme()
  const style = StyleSheet.create({
    container: {
      backgroundColor: ColorPallet.brand.primaryBackground,
    },
  })

  const checkPin = async (pin: string) => {
    const keyForPIN = await generateKeyForPin(pin)
    const keychainEntry = await getWalletKey()
    if (keychainEntry && keyForPIN === keychainEntry.walletKey) {
      setAuthenticated(true)
    } else {
      setModalVisible(true)
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
        <PinInput onPinChanged={setPin} testID="EnterPIN" autoFocus={true} />
        <Button
          title={t('Global.Enter')}
          buttonType={ButtonType.Primary}
          testID={testIdWithKey('Enter')}
          accessibilityLabel={t('Global.Enter')}
          onPress={() => {
            Keyboard.dismiss()
            checkPin(pin)
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
