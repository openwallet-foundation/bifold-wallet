import React from 'react'
import { View, StyleSheet, Keyboard } from 'react-native'
import { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'

import KeyboardView from '../../components/views/KeyboardView'
import FauxHeader from '../../components/misc/FauxHeader'
import SafeAreaModal from '../../components/modals/SafeAreaModal'
import AlertModal from '../../components/modals/AlertModal'
import PINScreenTitleText from '../../components/misc/PINScreenTitleText'
import { InlineMessageProps } from '../../components/inputs/InlineErrorText'
import PINInput from '../../components/inputs/PINInput'
import usePreventScreenCapture from '../../hooks/screen-capture'
import { useAnimatedComponents } from '../../contexts/animated-components'
import { usePINValidation } from '../../hooks/usePINValidation'
import { useTheme } from '../../contexts/theme'
import { TOKENS, useServices } from '../../container-api'
import { testIdWithKey } from '../../utils/testable'

interface ConfirmPINModalProps {
  errorMessage?: InlineMessageProps
  modalUsage: ConfirmPINModalUsage
  onBackPressed: () => void
  onConfirmPIN: (...args: any[]) => void
  PINOne?: string
  title: string
  visible: boolean
  isLoading: boolean
}

export enum ConfirmPINModalUsage {
  PIN_CREATE,
  PIN_CHANGE,
}

const ConfirmPINModal: React.FC<ConfirmPINModalProps> = ({
  errorMessage,
  modalUsage = ConfirmPINModalUsage.PIN_CREATE,
  onBackPressed = () => {},
  onConfirmPIN = () => {},
  PINOne = '',
  title = '',
  visible = false,
  isLoading = false,
}: ConfirmPINModalProps) => {
  const { ColorPalette, NavigationTheme } = useTheme()
  const [PINTwo, setPINTwo] = useState('')
  const { t } = useTranslation()
  const [PINHeader, { preventScreenCapture }] = useServices([TOKENS.COMPONENT_PIN_HEADER, TOKENS.CONFIG])
  usePreventScreenCapture(preventScreenCapture)
  const { modalState } = usePINValidation(PINOne, PINTwo)
  const { ButtonLoading } = useAnimatedComponents()

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
              if (userPinInput.length === PINOne.length) {
                Keyboard.dismiss()
                await onConfirmPIN(PINOne, userPinInput)
              }
            }}
            testID={testIdWithKey('EnterPIN')}
            accessibilityLabel={t('PINCreate.EnterPIN')}
            autoFocus={false}
            inlineMessage={errorMessage}
          />
          {isLoading && (
            <View style={style.loadingContainer}>
              <ButtonLoading size={50} />
            </View>
          )}
          {modalState.visible && (
            <AlertModal title={modalState.title} message={modalState.message} submit={modalState.onModalDismiss} />
          )}
        </View>
      </KeyboardView>
    </SafeAreaModal>
  )
}

export default ConfirmPINModal
