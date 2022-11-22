import { useNavigation } from '@react-navigation/core'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, StyleSheet, Text, StatusBar, View, Keyboard } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Button, ButtonType } from '../components/buttons/Button'
import PinInput from '../components/inputs/PinInput'
import { InfoBoxType } from '../components/misc/InfoBox'
import PopupModal from '../components/modals/PopupModal'
import { useAuth } from '../contexts/auth'
import { useTheme } from '../contexts/theme'
import { BifoldError } from '../types/error'
import { Screens, SettingStackParams } from '../types/navigators'
import { hashPIN } from '../utils/crypto'
import { statusBarStyleForColor, StatusBarStyles } from '../utils/luminance'
import { testIdWithKey } from '../utils/testable'

const PinRecreate: React.FC = () => {
  const { t } = useTranslation()
  const navigation = useNavigation<StackNavigationProp<SettingStackParams>>()
  const { getWalletCredentials } = useAuth()

  const [pin, setPin] = useState('')
  const [continueEnabled, setContinueEnabled] = useState(true)
  const [alertModalVisible, setAlertModalVisible] = useState<boolean>(false)

  const { ColorPallet, TextTheme } = useTheme()
  const style = StyleSheet.create({
    container: {
      height: '100%',
      backgroundColor: ColorPallet.brand.primaryBackground,
      padding: 20,
    },
    notifyText: {
      ...TextTheme.normal,
      marginVertical: 5,
    },
  })

  const verifyPIN = async (pin: string) => {
    try {
      const credentials = await getWalletCredentials()
      if (!credentials) {
        throw new BifoldError(t('Error.Title1036'), t('Error.Message1036'), t('Error.Message1036'), 1036)
      }

      const key = await hashPIN(pin, credentials.salt)

      if (credentials.key !== key) {
        setAlertModalVisible(true)
      } else {
        navigation.navigate(Screens.CreatePin)
      }
    } catch (error) {
      /* eslint-disable:no-empty */
    }
  }

  const onVerifyPIN = async (pin: string) => {
    try {
      setContinueEnabled(false)
      await verifyPIN(pin)
    } catch (error: unknown) {
      /* eslint-disable:no-empty */
    }
  }

  return (
    <SafeAreaView>
      <StatusBar
        barStyle={
          Platform.OS === 'android' ? StatusBarStyles.Light : statusBarStyleForColor(style.container.backgroundColor)
        }
      />
      <View style={[style.container]}>
        <Text style={[TextTheme.normal, { marginBottom: 16 }]}>
          <Text style={{ fontWeight: 'bold' }}>{t('PinCreate.RememberPIN')}</Text> {t('PinCreate.PINDisclaimer')}
        </Text>
        <PinInput
          label={t('PinCreate.EnterYourCurrentPIN')}
          testID={testIdWithKey('EnterCurrentPIN')}
          accessibilityLabel={t('PinCreate.EnterYourCurrentPIN')}
          onPinChanged={setPin}
          autoFocus={true}
        />
      </View>
      <View style={{ marginTop: 'auto', margin: 20 }}>
        <Button
          title={t('PinCreate.Continue')}
          testID={testIdWithKey('Continue')}
          accessibilityLabel={t('PinCreate.Continue')}
          buttonType={ButtonType.Primary}
          disabled={!continueEnabled}
          onPress={async () => {
            Keyboard.dismiss()
            await onVerifyPIN(pin)
          }}
        />
      </View>
      {alertModalVisible && (
        <PopupModal
          notificationType={InfoBoxType.Info}
          title={t('PinEnter.IncorrectPIN')}
          bodyContent={
            <View>
              <Text style={style.notifyText}>{t('PinEnter.RepeatPIN')}</Text>
            </View>
          }
          onCallToActionLabel={t('Global.Okay')}
          onCallToActionPressed={() => {
            setAlertModalVisible(false)
            setContinueEnabled(true)
          }}
        />
      )}
    </SafeAreaView>
  )
}

export default PinRecreate
