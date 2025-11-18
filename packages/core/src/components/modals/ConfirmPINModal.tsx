import React, { useState } from 'react'
import { View, StyleSheet, Keyboard } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'

import KeyboardView from '../../components/views/KeyboardView'
import FauxHeader from '../../components/misc/FauxHeader'
import SafeAreaModal from '../../components/modals/SafeAreaModal'
import AlertModal from '../../components/modals/AlertModal'
import PINScreenTitleText from '../../components/misc/PINScreenTitleText'
import PINInput from '../../components/inputs/PINInput'
import usePreventScreenCapture from '../../hooks/screen-capture'
import { useAnimatedComponents } from '../../contexts/animated-components'
import { usePINValidation, ModalState } from '../../hooks/usePINValidation'
import { InlineErrorType } from '../../components/inputs/InlineErrorText'
import { useTheme } from '../../contexts/theme'
import { TOKENS, useServices } from '../../container-api'
import { testIdWithKey } from '../../utils/testable'
import { InlineErrorConfig } from '../../types/error'

interface ConfirmPINModalProps {
  errorModalState?: ModalState
  modalUsage: ConfirmPINModalUsage
  onBackPressed: () => void
  onConfirmPIN: (pin: string) => void
  PINOne?: string
  setPINTwo?: (pin: string) => void
  title: string
  visible: boolean
  isLoading: boolean
}

export enum ConfirmPINModalUsage {
  PIN_CREATE,
  PIN_CHANGE,
}

interface ErrorMessage {
  message: string
  inlineType: InlineErrorType
  config: InlineErrorConfig
}

const ConfirmPINModal: React.FC<ConfirmPINModalProps> = ({
  errorModalState,
  modalUsage = ConfirmPINModalUsage.PIN_CREATE,
  onBackPressed = () => {},
  onConfirmPIN = () => {},
  PINOne = '',
  setPINTwo = () => {},
  title = '',
  visible = false,
  isLoading = false,
}: ConfirmPINModalProps) => {
  const { ColorPalette, NavigationTheme } = useTheme()
  const { t } = useTranslation()
  const [PINHeader, { preventScreenCapture }, inlineMessages] = useServices([
    TOKENS.COMPONENT_PIN_HEADER,
    TOKENS.CONFIG,
    TOKENS.INLINE_ERRORS,
  ])
  usePreventScreenCapture(preventScreenCapture)
  const { comparePINEntries } = usePINValidation(PINOne)

  const customErrorMessage = {
    message: t('PINCreate.PINsDoNotMatch'),
    inlineType: InlineErrorType.error,
    config: inlineMessages,
  }
  const [errorMessage, setErrorMessage] = useState<ErrorMessage | undefined>(undefined)
  const { LoadingSpinner } = useAnimatedComponents()

  const style = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: ColorPalette.brand.primaryBackground,
    },
    loadingContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
    },
  })

  return (
    <SafeAreaModal
      style={{ backgroundColor: ColorPalette.brand.primaryBackground }}
      visible={visible}
      transparent={false}
      animationType={'none'}
      presentationStyle={'fullScreen'}
      statusBarTranslucent={true}
    >
      <SafeAreaView edges={['top']} style={{ backgroundColor: NavigationTheme.colors.primary }} />
      <FauxHeader title={title} onBackPressed={onBackPressed} showBackButton />
      <KeyboardView keyboardAvoiding={true}>
        <View style={style.container}>
          {modalUsage === ConfirmPINModalUsage.PIN_CREATE && (
            <PINScreenTitleText header={t('PINCreate.Header')} subheader={t('PINCreate.Subheader')} />
          )}
          <PINHeader />
          <PINInput
            label={t('PINCreateConfirm.PINInputLabel')}
            onPINChanged={async (userPinInput: string) => {
              setPINTwo(userPinInput)
              setErrorMessage(undefined)
              if (userPinInput.length === PINOne.length) {
                Keyboard.dismiss()
                if (!comparePINEntries(PINOne, userPinInput)) setErrorMessage(customErrorMessage)
                else await onConfirmPIN(userPinInput)
              }
            }}
            testID={testIdWithKey('EnterPIN')}
            accessibilityLabel={t('PINCreate.EnterPIN')}
            autoFocus={false}
            inlineMessage={errorMessage}
          />
          {isLoading && (
            <View style={style.loadingContainer}>
              <LoadingSpinner size={50} color={ColorPalette.brand.primary} />
            </View>
          )}
          {errorModalState?.visible && (
            <AlertModal
              title={errorModalState?.title}
              message={errorModalState?.message}
              submit={errorModalState?.onModalDismiss}
            />
          )}
        </View>
      </KeyboardView>
    </SafeAreaModal>
  )
}

export default ConfirmPINModal
