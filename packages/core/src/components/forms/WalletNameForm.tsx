import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import { DispatchAction } from '../../contexts/reducers/store'
import { useStore } from '../../contexts/store'
import { useTheme } from '../../contexts/theme'
import { generateRandomWalletName } from '../../utils/helpers'
import { testIdWithKey } from '../../utils/testable'
import ButtonLoading from '../animated/ButtonLoading'
import Button, { ButtonType } from '../buttons/Button'
import LimitedTextInput from '../inputs/LimitedTextInput'
import { InfoBoxType } from '../misc/InfoBox'
import PopupModal from '../modals/PopupModal'
import { ThemedText } from '../texts/ThemedText'
import KeyboardView from '../views/KeyboardView'

type ErrorState = {
  visible: boolean
  title: string
  description: string
}

interface NameWalletProps {
  isRenaming?: boolean
  onSubmitSuccess?: (name: string) => void
  onCancel?: () => void
}

const NameWalletForm: React.FC<NameWalletProps> = ({ isRenaming, onSubmitSuccess, onCancel }) => {
  const { t } = useTranslation()
  const { ColorPallet, Assets, Spacing } = useTheme()
  const [store, dispatch] = useStore()
  const [loading, setLoading] = useState(false)
  const [walletName, setWalletName] = useState(store.preferences.walletName ?? generateRandomWalletName())
  const [errorState, setErrorState] = useState<ErrorState>({
    visible: false,
    title: '',
    description: '',
  })

  const styles = StyleSheet.create({
    screenContainer: {
      flex: 1,
      backgroundColor: ColorPallet.brand.primaryBackground,
      padding: Spacing.md,
      justifyContent: 'space-between',
    },
    contentContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
    },
    controlsContainer: {},
    buttonContainer: {
      width: '100%',
    },
  })

  const handleChangeText = (text: string) => {
    setWalletName(text)
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
      dispatch({ type: DispatchAction.DID_NAME_WALLET })
      onSubmitSuccess?.(walletName)
    }
  }

  const handleDismissError = () => {
    setErrorState((prev) => ({ ...prev, visible: false }))
  }

  return (
    <KeyboardView>
      <View style={styles.screenContainer}>
        <View style={styles.contentContainer}>
          <Assets.svg.contactBook height={100} style={{ marginVertical: Spacing.md }} />
          <ThemedText style={{ width: '100%', marginBottom: Spacing.md }}>{t('NameWallet.ThisIsTheName')}</ThemedText>
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
              title={isRenaming ? t('Global.Save') : t('Global.Continue')}
              buttonType={ButtonType.Primary}
              testID={isRenaming ? testIdWithKey('Save') : testIdWithKey('Continue')}
              accessibilityLabel={isRenaming ? t('Global.Save') : t('Global.Continue')}
              onPress={handleContinuePressed}
              disabled={loading}
            >
              {loading && <ButtonLoading />}
            </Button>
            {isRenaming && (
              <View style={{ marginTop: Spacing.sm }}>
                <Button
                  title={t('Global.Cancel')}
                  buttonType={ButtonType.Secondary}
                  testID={testIdWithKey('Cancel')}
                  accessibilityLabel={t('Global.Cancel')}
                  onPress={onCancel}
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

export default NameWalletForm
