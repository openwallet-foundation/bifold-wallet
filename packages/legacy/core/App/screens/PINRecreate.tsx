import { useNavigation } from '@react-navigation/core'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, StyleSheet, Text, StatusBar, View, Keyboard } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import Button, { ButtonType } from '../components/buttons/Button'
import PINInput from '../components/inputs/PINInput'
import { InfoBoxType } from '../components/misc/InfoBox'
import PopupModal from '../components/modals/PopupModal'
import { useAuth } from '../contexts/auth'
import { useTheme } from '../contexts/theme'
import { BifoldError } from '../types/error'
import { Screens, SettingStackParams } from '../types/navigators'
import { hashPIN } from '../utils/crypto'
import { statusBarStyleForColor, StatusBarStyles } from '../utils/luminance'
import { testIdWithKey } from '../utils/testable'

const PINRecreate: React.FC = () => {
  const { t } = useTranslation()
  const navigation = useNavigation<StackNavigationProp<SettingStackParams>>()
  const { getWalletCredentials } = useAuth()

  const [PIN, setPIN] = useState('')
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

  const verifyPIN = async (PIN: string) => {
    try {
      const credentials = await getWalletCredentials()
      if (!credentials) {
        throw new BifoldError(t('Error.Title1036'), t('Error.Message1036'), t('Error.Message1036'), 1036)
      }

      const key = await hashPIN(PIN, credentials.salt)

      if (credentials.key !== key) {
        setAlertModalVisible(true)
      } else {
        navigation.navigate(Screens.CreatePIN)
      }
    } catch (error) {
      /* eslint-disable:no-empty */
    }
  }

  const onVerifyPIN = async (PIN: string) => {
    try {
      setContinueEnabled(false)
      await verifyPIN(PIN)
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
          <Text style={{ fontWeight: 'bold' }}>{t('PINCreate.RememberPIN')}</Text> {t('PINCreate.PINDisclaimer')}
        </Text>
        <PINInput
          label={t('PINCreate.EnterYourCurrentPIN')}
          testID={testIdWithKey('EnterCurrentPIN')}
          accessibilityLabel={t('PINCreate.EnterYourCurrentPIN')}
          onPINChanged={setPIN}
          autoFocus={true}
        />
      </View>
      <View style={{ marginTop: 'auto', margin: 20 }}>
        <Button
          title={t('PINCreate.Continue')}
          testID={testIdWithKey('Continue')}
          accessibilityLabel={t('PINCreate.Continue')}
          buttonType={ButtonType.Primary}
          disabled={!continueEnabled}
          onPress={async () => {
            Keyboard.dismiss()
            await onVerifyPIN(PIN)
          }}
        />
      </View>
      {alertModalVisible && (
        <PopupModal
          notificationType={InfoBoxType.Info}
          title={t('PINEnter.IncorrectPIN')}
          bodyContent={
            <View>
              <Text style={style.notifyText}>{t('PINEnter.RepeatPIN')}</Text>
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

export default PINRecreate
