import { ParamListBase } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AccessibilityInfo,
  DeviceEventEmitter,
  Keyboard,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  findNodeHandle,
} from 'react-native'

// eslint-disable-next-line import/no-named-as-default
import { ButtonType } from '../components/buttons/Button-api'
import PINInput from '../components/inputs/PINInput'
import PINValidationHelper from '../components/misc/PINValidationHelper'
import AlertModal from '../components/modals/AlertModal'
import KeyboardView from '../components/views/KeyboardView'
import { EventTypes, minPINLength } from '../constants'
import usePreventScreenCapture from '../hooks/screen-capture'
import { usePINValidation } from '../hooks/usePINValidation'
import { useAuth } from '../contexts/auth'
import { TOKENS, useServices } from '../container-api'
import { useAnimatedComponents } from '../contexts/animated-components'
import { useTheme } from '../contexts/theme'
import { Screens } from '../types/navigators'
import { BifoldError } from '../types/error'
import { testIdWithKey } from '../utils/testable'
import PINScreenTitleText from '../components/misc/PINScreenTitleText'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import ConfirmPINModal, { ConfirmPINModalUsage } from '../components/modals/ConfirmPINModal'

interface PINCreateProps extends StackScreenProps<ParamListBase, Screens.CreatePIN> {
  explainedStatus: boolean
  setAuthenticated: (status: boolean) => void
}

const PINCreate: React.FC<PINCreateProps> = ({ explainedStatus, setAuthenticated }) => {
  const [, dispatch] = useStore()
  const { setPIN: setWalletPIN } = useAuth()
  const PINTwoInputRef = useRef<TextInput>(null)
  const [PIN, setPIN] = useState('')
  const [PINTwo, setPINTwo] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useTranslation()
  const { ColorPalette } = useTheme()
  const { ButtonLoading } = useAnimatedComponents()
  const createPINButtonRef = useRef<TouchableOpacity>(null)
  const [
    PINExplainer,
    PINHeader,
    { showPINExplainer, preventScreenCapture, PINScreensConfig },
    Button,
    inlineMessages,
  ] = useServices([
    TOKENS.SCREEN_PIN_EXPLAINER,
    TOKENS.COMPONENT_PIN_HEADER,
    TOKENS.CONFIG,
    TOKENS.COMP_BUTTON,
    TOKENS.INLINE_ERRORS,
  ])
  const [PINConfirmModalVisible, setPINConfirmModalVisible] = useState(false)
  const [explained, setExplained] = useState(explainedStatus || showPINExplainer === false)
  const { PINValidations, validatePINEntry, inlineMessageField1, inlineMessageField2, modalState, PINSecurity } =
    usePINValidation(PIN, PINTwo)
  usePreventScreenCapture(preventScreenCapture)

  const style = StyleSheet.create({
    screenContainer: {
      height: '100%',
      backgroundColor: ColorPalette.brand.primaryBackground,
      padding: 20,
      justifyContent: 'space-between',
    },
    // below used as helpful labels for views, no properties needed atp
    contentContainer: {},
    controlsContainer: {},
    infoBox: {
      marginBottom: 24,
    },
  })

  const handleConfirmPINFlow = useCallback(
    async (pin: string) => {
      if (validatePINEntry(pin, pin)) {
        setPINConfirmModalVisible(true)
      }
    },
    [validatePINEntry]
  )

  const passcodeCreate = useCallback(
    async (PIN: string) => {
      try {
        await setWalletPIN(PIN)
        setAuthenticated(true)
        // this dispatch finishes this step of onboarding and will cause a navigation
        dispatch({
          type: DispatchAction.DID_CREATE_PIN,
        })
      } catch (err: unknown) {
        const error = new BifoldError(
          t('Error.Title1040'),
          t('Error.Message1040'),
          (err as Error)?.message ?? err,
          1040
        )
        DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
      }
    },
    [setWalletPIN, setAuthenticated, dispatch, t]
  )

  const onConfirmPIN = useCallback(
    async (pinOne: string, pinTwo: string) => {
      if (validatePINEntry(pinOne, pinTwo)) {
        await passcodeCreate(pinOne)
      }
    },
    [passcodeCreate, validatePINEntry]
  )

  const onCreatePIN = useCallback(async () => {
    setIsLoading(true)
    if (validatePINEntry(PIN, PINTwo)) {
      await passcodeCreate(PIN)
    }
    setIsLoading(false)
  }, [passcodeCreate, validatePINEntry, PIN, PINTwo])

  const modalBackButtonPressed = () => {
    setPINConfirmModalVisible(false)
  }

  const isContinueDisabled = useMemo((): boolean => {
    if (inlineMessages.enabled) {
      return false
    }
    return isLoading || PIN.length < minPINLength
  }, [isLoading, PIN, inlineMessages])

  const continueCreatePIN = useCallback(() => {
    setExplained(true)
  }, [])

  return explained ? (
    <KeyboardView keyboardAvoiding={true}>
      <View style={style.screenContainer}>
        <View style={style.contentContainer}>
          <PINScreenTitleText header={t('PINCreate.Header')} subheader={t('PINCreate.Subheader')} />
          <PINHeader />
          <PINInput
            label={t('PINCreate.EnterPINTitle')}
            onPINChanged={async (p: string) => {
              setPIN(() => p)
              if (p.length === minPINLength && PINScreensConfig.useNewPINDesign) {
                Keyboard.dismiss()
                await handleConfirmPINFlow(p)
              } else if (!PINScreensConfig.useNewPINDesign && p.length === minPINLength && PINTwoInputRef?.current) {
                PINTwoInputRef.current.focus()
                const reactTag = findNodeHandle(PINTwoInputRef.current)
                if (reactTag) {
                  AccessibilityInfo.setAccessibilityFocus(reactTag)
                }
              }
            }}
            testID={testIdWithKey('EnterPIN')}
            accessibilityLabel={t('PINCreate.EnterPIN')}
            autoFocus={false}
            inlineMessage={inlineMessageField1}
          />
          {!PINScreensConfig.useNewPINDesign && (
            <PINInput
              label={t('PINCreate.ReenterPIN')}
              onPINChanged={(userPinInput: string) => {
                setPINTwo(userPinInput)
                if (userPinInput.length === minPINLength) {
                  Keyboard.dismiss()
                  const reactTag = createPINButtonRef?.current && findNodeHandle(createPINButtonRef.current)
                  if (reactTag) {
                    AccessibilityInfo.setAccessibilityFocus(reactTag)
                  }
                }
              }}
              testID={testIdWithKey('ReenterPIN')}
              accessibilityLabel={t('PINCreate.ReenterPIN')}
              autoFocus={false}
              ref={PINTwoInputRef}
              inlineMessage={inlineMessageField2}
            />
          )}
          {PINSecurity.displayHelper && <PINValidationHelper validations={PINValidations} />}
          {modalState.visible && (
            <AlertModal title={modalState.title} message={modalState.message} submit={modalState.onModalDismiss} />
          )}
        </View>
        {!PINScreensConfig.useNewPINDesign && (
          <View style={style.controlsContainer}>
            <Button
              title={t('PINCreate.CreatePIN')}
              testID={testIdWithKey('CreatePIN')}
              accessibilityLabel={t('PINCreate.CreatePIN')}
              buttonType={ButtonType.Primary}
              disabled={isContinueDisabled}
              onPress={onCreatePIN}
              ref={createPINButtonRef}
            >
              {isLoading ? <ButtonLoading /> : null}
            </Button>
          </View>
        )}
        <ConfirmPINModal
          errorMessage={inlineMessageField2}
          modalUsage={ConfirmPINModalUsage.PIN_CREATE}
          onBackPressed={modalBackButtonPressed}
          onConfirmPIN={onConfirmPIN}
          PINOne={PIN}
          title={t('Screens.CreatePIN')}
          visible={PINConfirmModalVisible}
          isLoading={isLoading}
        />
      </View>
    </KeyboardView>
  ) : (
    <PINExplainer continueCreatePIN={continueCreatePIN} />
  )
}

export default PINCreate
