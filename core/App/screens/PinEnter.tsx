import React, { useEffect, useState, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, StatusBar, Keyboard, StyleSheet, Text, Image, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import Button, { ButtonType } from '../components/buttons/Button'
import PinInput from '../components/inputs/PinInput'
import { InfoBoxType } from '../components/misc/InfoBox'
import AlertModal from '../components/modals/AlertModal'
import PopupModal from '../components/modals/PopupModal'
import { useAuth } from '../contexts/auth'
import { DispatchAction } from '../contexts/reducers/store'
import { StoreContext, useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { GenericFn } from '../types/fn'
import { statusBarStyleForColor, StatusBarStyles } from '../utils/luminance'
import { testIdWithKey } from '../utils/testable'

interface PinEnterProps {
  setAuthenticated: GenericFn
}

const PinEnter: React.FC<PinEnterProps> = ({ setAuthenticated }) => {
  const { t } = useTranslation()
  const { checkPIN, getWalletCredentials } = useAuth()
  const [, dispatch] = useStore()
  const [pin, setPin] = useState<string>('')
  const [continueEnabled, setContinueEnabled] = useState(true)
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const { ColorPallet, TextTheme, Assets } = useTheme()
  const [state] = useContext(StoreContext)

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

  useEffect(() => {
    if (!state.preferences.useBiometry) {
      return
    }

    const loadWalletCredentials = async () => {
      const creds = await getWalletCredentials()
      if (creds && creds.key) {
        dispatch({
          type: DispatchAction.LOCKOUT_UPDATED,
          payload: [{ displayNotification: false }],
        })
        setAuthenticated()
      }
    }

    loadWalletCredentials().catch((error: unknown) => {
      // TODO:(jl) Handle error
    })
  }, [])

  const onPinInputCompleted = async (pin: string) => {
    try {
      setContinueEnabled(false)
      const result = await checkPIN(pin)
      if (!result) {
        setModalVisible(true)
        setContinueEnabled(true)

        return
      }
      setAuthenticated()
      return
    } catch (error: unknown) {
      // TODO:(jl) process error
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
        {modalVisible && (
          <AlertModal title={t('PinEnter.IncorrectPIN')} message="" submit={() => setModalVisible(false)} />
        )}
        {state.lockout.displayNotification && (
          <PopupModal
            notificationType={InfoBoxType.Info}
            title={t('PinEnter.LoggedOut')}
            bodyContent={
              <View>
                <Text style={style.notifyText}>{t('PinEnter.LoggedOutDescription')}</Text>
              </View>
            }
            onCallToActionLabel={t('Global.Okay')}
            onCallToActionPressed={() => {
              dispatch({
                type: DispatchAction.LOCKOUT_UPDATED,
                payload: [{ displayNotification: false }],
              })
            }}
          />
        )}
      </View>
      <View style={{ marginTop: 'auto', margin: 20 }}>
        <Button
          title={t('Global.Enter')}
          buttonType={ButtonType.Primary}
          testID={testIdWithKey('Enter')}
          disabled={!continueEnabled}
          accessibilityLabel={t('Global.Enter')}
          onPress={() => {
            Keyboard.dismiss()
            onPinInputCompleted(pin)
          }}
        />
      </View>
    </SafeAreaView>
  )
}

export default PinEnter
