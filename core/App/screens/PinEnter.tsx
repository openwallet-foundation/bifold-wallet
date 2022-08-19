import React, { useEffect, useState, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, StatusBar, Keyboard, StyleSheet, Text, Image, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import Button, { ButtonType } from '../components/buttons/Button'
import PinInput from '../components/inputs/PinInput'
import AlertModal from '../components/modals/AlertModal'
import { useAuth } from '../contexts/auth'
import { StoreContext } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { statusBarStyleForColor, StatusBarStyles } from '../utils/luminance'
import { testIdWithKey } from '../utils/testable'

interface PinEnterProps {
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
}

const PinEnter: React.FC<PinEnterProps> = ({ setAuthenticated }) => {
  const { t } = useTranslation()
  const { checkPIN, getWalletCredentials } = useAuth()
  const [pin, setPin] = useState<string>('')
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const { ColorPallet, TextTheme, Assets } = useTheme()
  const [state] = useContext(StoreContext)

  const style = StyleSheet.create({
    container: {
      backgroundColor: ColorPallet.brand.primaryBackground,
    },
  })

  useEffect(() => {
    if (!state.preferences.useBiometry) {
      return
    }

    const loadWalletCredentials = async () => {
      const creds = await getWalletCredentials()
      if (creds && creds.walletKey) {
        setAuthenticated(true)
      }
    }

    loadWalletCredentials().catch((error: unknown) => {
      // TODO:(jl) Handle error
    })
  }, [])

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
      <StatusBar
        barStyle={
          Platform.OS === 'android' ? StatusBarStyles.Light : statusBarStyleForColor(style.container.backgroundColor)
        }
      />
      <View style={{ margin: 20 }}>
        <Image
          source={Assets.img.logoSecondary.src}
          style={{
            height: Assets.img.logoSecondary.height,
            width: Assets.img.logoSecondary.width,
            resizeMode: Assets.img.logoSecondary.resizeMode,
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
