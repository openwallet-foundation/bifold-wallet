import { useAgent } from '@credo-ts/react-hooks'
import { useNavigation } from '@react-navigation/core'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'

import ButtonLoading from '../components/animated/ButtonLoading'
import Button, { ButtonType } from '../components/buttons/Button'
import LimitedTextInput from '../components/inputs/LimitedTextInput'
import { InfoBoxType } from '../components/misc/InfoBox'
import PopupModal from '../components/modals/PopupModal'
import KeyboardView from '../components/views/KeyboardView'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { generateRandomWalletName } from '../utils/helpers'
import { testIdWithKey } from '../utils/testable'

type ErrorState = {
  visible: boolean
  title: string
  description: string
}

const NameWallet: React.FC = () => {
  const { t } = useTranslation()
  const { ColorPallet, TextTheme, Assets } = useTheme()
  const navigation = useNavigation()
  const [store, dispatch] = useStore()
  const { agent } = useAgent()
  const [walletName, setWalletName] = useState(store.preferences.walletName ?? generateRandomWalletName())
  const [loading, setLoading] = useState(false)
  const onBoardingComplete =
    (store.onboarding.onboardingVersion !== 0 && store.onboarding.didCompleteOnboarding) ||
    (store.onboarding.onboardingVersion === 0 && store.onboarding.didConsiderBiometry)
  const [errorState, setErrorState] = useState<ErrorState>({
    visible: false,
    title: '',
    description: '',
  })

  const styles = StyleSheet.create({
    screenContainer: {
      height: '100%',
      backgroundColor: ColorPallet.brand.primaryBackground,
      padding: 20,
      justifyContent: 'space-between',
    },

    contentContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
    },
    // below used as helpful label for view, no properties needed atp
    controlsContainer: {},

    buttonContainer: {
      width: '100%',
    },
  })

  const handleChangeText = (text: string) => {
    setWalletName(text)
  }

  const handleCancelPressed = () => {
    navigation.goBack()
  }

  const handleContinuePressed = () => {
    if (walletName.length < 1) {
      setErrorState({
        title: t('NameWallet.EmptyNameTitle'),
        description: t('NameWallet.EmptyNameDescription'),
        visible: true,
      })
    } else if (walletName.length > 50) {
      setErrorState({
        title: t('NameWallet.CharCountTitle'),
        description: t('NameWallet.CharCountDescription'),
        visible: true,
      })
    } else {
      setLoading(true)
      dispatch({
        type: DispatchAction.UPDATE_WALLET_NAME,
        payload: [walletName],
      })
      if (agent) {
        agent.config.label = walletName
      }
      dispatch({ type: DispatchAction.DID_NAME_WALLET })
      if (store.onboarding.didCompleteOnboarding) {
        navigation.goBack()
      } else {
        dispatch({ type: DispatchAction.DID_COMPLETE_ONBOARDING, payload: [true] })
      }
    }
  }

  const handleDismissError = () => {
    setErrorState((prev) => ({ ...prev, visible: false }))
  }

  return (
    <KeyboardView>
      <View style={styles.screenContainer}>
        <View style={styles.contentContainer}>
          <Assets.svg.contactBook height={100} style={{ marginVertical: 20 }} />
          <Text style={[TextTheme.normal, { width: '100%', marginBottom: 16 }]}>{t('NameWallet.ThisIsTheName')}</Text>
          <View style={{ width: '100%' }}>
            <LimitedTextInput
              defaultValue={walletName}
              label={t('NameWallet.NameYourWallet')}
              limit={50}
              handleChangeText={handleChangeText}
              accessibilityLabel={t('NameWallet.NameYourWallet')}
              testID={testIdWithKey('NameInput')}
            />
          </View>
        </View>
        <View style={styles.controlsContainer}>
          <View style={styles.buttonContainer}>
            <Button
              title={onBoardingComplete ? t('Global.Save') : t('Global.Continue')}
              buttonType={ButtonType.Primary}
              testID={onBoardingComplete ? testIdWithKey('Save') : testIdWithKey('Continue')}
              accessibilityLabel={onBoardingComplete ? t('Global.Save') : t('Global.Continue')}
              onPress={handleContinuePressed}
              disabled={loading}
            >
              {loading && <ButtonLoading />}
            </Button>
            {onBoardingComplete && (
              <View style={{ marginTop: 15 }}>
                <Button
                  title={t('Global.Cancel')}
                  buttonType={ButtonType.Secondary}
                  testID={testIdWithKey('Cancel')}
                  accessibilityLabel={t('Global.Cancel')}
                  onPress={handleCancelPressed}
                />
              </View>
            )}
          </View>
        </View>
      </View>
      {errorState.visible && (
        <PopupModal
          notificationType={InfoBoxType.Info}
          onCallToActionLabel={t('Global.Okay')}
          onCallToActionPressed={handleDismissError}
          title={errorState.title}
          description={errorState.description}
        />
      )}
    </KeyboardView>
  )
}

export default NameWallet
