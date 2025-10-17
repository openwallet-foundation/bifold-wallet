import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard, StyleSheet, View } from 'react-native'

import Button, { ButtonType } from '../components/buttons/Button'
import { InlineMessageProps } from '../components/inputs/InlineErrorText'
import PINInput from '../components/inputs/PINInput'
import { InfoBoxType } from '../components/misc/InfoBox'
import PopupModal from '../components/modals/PopupModal'
import { ThemedText } from '../components/texts/ThemedText'
import KeyboardView from '../components/views/KeyboardView'
import { minPINLength } from '../constants'
import { TOKENS, useServices } from '../container-api'
import { useAnimatedComponents } from '../contexts/animated-components'
import { useAuth } from '../contexts/auth'
import { useTheme } from '../contexts/theme'
import usePreventScreenCapture from '../hooks/screen-capture'
import { testIdWithKey } from '../utils/testable'
import { InlineErrorType } from '../components/inputs/InlineErrorText'

type PINVerifyProps = {
  setAuthenticated: (...args: any[]) => void
  usage?: PINEntryUsage
  onCancelAuth?: React.Dispatch<React.SetStateAction<boolean>> | (() => void)
}

export enum PINEntryUsage {
  PINCheck,
  ChangeBiometrics,
  ChangePIN,
}

const PINVerify: React.FC<PINVerifyProps> = ({ setAuthenticated, usage = PINEntryUsage.PINCheck, onCancelAuth }) => {
  const { t } = useTranslation()
  const { verifyPIN } = useAuth()
  const [PIN, setPIN] = useState<string>('')
  const [continueDisabled, setContinueDisabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [alertModalVisible, setAlertModalVisible] = useState<boolean>(false)
  const { ColorPalette } = useTheme()
  const { ButtonLoading } = useAnimatedComponents()
  const [inlineMessageField, setInlineMessageField] = useState<InlineMessageProps>()
  const [{ preventScreenCapture }, inlineMessages] = useServices([TOKENS.CONFIG, TOKENS.INLINE_ERRORS])
  usePreventScreenCapture(preventScreenCapture)

  useEffect(() => {
    setInlineMessageField(undefined)
  }, [PIN])

  const clearAlertModal = useCallback(() => {
    setAlertModalVisible(false)
    usage !== PINEntryUsage.ChangePIN && setAuthenticated(false)
  }, [setAlertModalVisible, setAuthenticated, usage])

  const onPINInputCompleted = useCallback(
    async (userPinInput?: string) => {
      setLoading(true)
      setContinueDisabled(true)
      const isPINVerified = await verifyPIN(userPinInput ? userPinInput : PIN)
      if (isPINVerified) {
        setAuthenticated(usage === PINEntryUsage.ChangePIN ? userPinInput : true)
      } else {
        if (inlineMessages.enabled) {
          setInlineMessageField({
            message: t('PINEnter.IncorrectPIN'),
            inlineType: InlineErrorType.error,
            config: inlineMessages,
          })
        } else setAlertModalVisible(true)
      }
      setLoading(false)
      setContinueDisabled(false)
    },
    [verifyPIN, setLoading, setAuthenticated, setContinueDisabled, PIN, inlineMessages, t, usage]
  )

  const inputLabelText = {
    [PINEntryUsage.ChangeBiometrics]: t('PINEnter.ChangeBiometricsInputLabel'),
    [PINEntryUsage.PINCheck]: t('PINEnter.AppSettingChangedEnterPIN'),
    [PINEntryUsage.ChangePIN]: t('PINChange.EnterOldPIN'),
  }

  const inputTestId = {
    [PINEntryUsage.ChangeBiometrics]: 'BiometricChangedEnterPIN',
    [PINEntryUsage.PINCheck]: 'AppSettingChangedEnterPIN',
    [PINEntryUsage.ChangePIN]: 'EnterOldPIN',
  }

  const primaryButtonText = {
    [PINEntryUsage.ChangeBiometrics]: t('Global.Continue'),
    [PINEntryUsage.PINCheck]: t('PINEnter.AppSettingSave'),
    [PINEntryUsage.ChangePIN]: t('Global.Continue'),
  }

  const primaryButtonTestId = {
    [PINEntryUsage.ChangeBiometrics]: 'Continue',
    [PINEntryUsage.PINCheck]: 'AppSettingSave',
    [PINEntryUsage.ChangePIN]: 'Continue',
  }

  const helpText = {
    [PINEntryUsage.ChangeBiometrics]: t('PINEnter.ChangeBiometricsSubtext'),
    [PINEntryUsage.PINCheck]: t('PINEnter.AppSettingChanged'),
    [PINEntryUsage.ChangePIN]: '',
  }

  const isContinueDisabled = continueDisabled || PIN.length < minPINLength

  const style = StyleSheet.create({
    screenContainer: {
      flex: 1,
      padding: 20,
      backgroundColor: ColorPalette.brand.primaryBackground,
      justifyContent: 'space-between',
    },
    buttonContainer: {
      width: '100%',
    },
    helpText: {
      alignSelf: 'auto',
      textAlign: 'left',
      marginBottom: 40,
    },
    inputLabelText: {
      alignSelf: 'auto',
      textAlign: 'left',
      marginBottom: 20,
    },
    modalText: {
      marginVertical: 5,
    },
    changeBiometricsHeader: {
      marginTop: 0,
      marginBottom: 40,
    },
  })

  return (
    <KeyboardView keyboardAvoiding={true}>
      <View style={style.screenContainer}>
        <View>
          {usage === PINEntryUsage.ChangeBiometrics && (
            <ThemedText variant="headingTwo" style={style.changeBiometricsHeader}>
              {t('PINEnter.ChangeBiometricsHeader')}
            </ThemedText>
          )}
          {usage !== PINEntryUsage.ChangePIN && <ThemedText style={style.helpText}>{helpText[usage]}</ThemedText>}
          <ThemedText variant="bold" style={style.inputLabelText}>
            {inputLabelText[usage]}
            {usage === PINEntryUsage.ChangeBiometrics && (
              <ThemedText variant="caption">
                {` `}
                {t('PINEnter.ChangeBiometricsInputLabelParenthesis')}
              </ThemedText>
            )}
          </ThemedText>
          <PINInput
            onPINChanged={async (userPinInput: string) => {
              setPIN(userPinInput)
              if (userPinInput.length === minPINLength) {
                Keyboard.dismiss()
                usage === PINEntryUsage.ChangePIN && (await onPINInputCompleted(userPinInput))
              }
            }}
            testID={testIdWithKey(inputTestId[usage])}
            accessibilityLabel={inputLabelText[usage]}
            autoFocus={true}
            inlineMessage={inlineMessageField}
            onSubmitEditing={async (userPinInput) => {
              await onPINInputCompleted(userPinInput)
            }}
          />
        </View>
        {usage !== PINEntryUsage.ChangePIN && (
          <View style={style.buttonContainer}>
            <Button
              title={primaryButtonText[usage]}
              buttonType={ButtonType.Primary}
              testID={testIdWithKey(primaryButtonTestId[usage])}
              disabled={isContinueDisabled}
              accessibilityLabel={primaryButtonText[usage]}
              onPress={async () => {
                await onPINInputCompleted()
              }}
            >
              {loading && <ButtonLoading />}
            </Button>
          </View>
        )}
        {usage === PINEntryUsage.PINCheck && (
          <View style={[style.buttonContainer, { marginTop: 10 }]}>
            <Button
              title={t('PINEnter.AppSettingCancel')}
              buttonType={ButtonType.Secondary}
              testID={testIdWithKey('AppSettingCancel')}
              accessibilityLabel={t('PINEnter.AppSettingCancel')}
              onPress={() => onCancelAuth?.(false)}
            />
          </View>
        )}
      </View>
      {alertModalVisible && (
        <PopupModal
          notificationType={InfoBoxType.Info}
          title={t('PINEnter.IncorrectPIN')}
          onCallToActionLabel={t('Global.Okay')}
          onCallToActionPressed={clearAlertModal}
        />
      )}
    </KeyboardView>
  )
}

export default PINVerify
