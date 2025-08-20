import { ParamListBase } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  DeviceEventEmitter,
  Keyboard,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'

// eslint-disable-next-line import/no-named-as-default
import { ButtonType } from '../components/buttons/Button-api'
import PINInput from '../components/inputs/PINInput'
import PINValidationHelper from '../components/misc/PINValidationHelper'
import AlertModal from '../components/modals/AlertModal'
import KeyboardView from '../components/views/KeyboardView'
import PINScreenTitleText from '../components/misc/PINScreenTitleText'
import { EventTypes, maxPINLength, minPINLength } from '../constants'
import { TOKENS, useServices } from '../container-api'
import { useAnimatedComponents } from '../contexts/animated-components'
import { useAuth } from '../contexts/auth'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import usePreventScreenCapture from '../hooks/screen-capture'
import { usePINValidation } from '../hooks/usePINValidation'
import { BifoldError } from '../types/error'
import { Screens } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

interface PINCreateConfirmationProps extends StackScreenProps<ParamListBase, Screens.CreatePINConfirmation> {
  setAuthenticated: (status: boolean) => void
  explainedStatus: boolean
  prevPIN: string
}

const PINCreateConfirmation: React.FC<PINCreateConfirmationProps> = ({ setAuthenticated }) => {
  const { setPIN: setWalletPIN } = useAuth()
  const [PIN, setPIN] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [state, dispatch] = useStore()
  const { t } = useTranslation()

  const prevPIN = state.onboarding.PIN !== null && state.onboarding.PIN || ''

  const { ColorPalette } = useTheme()
  const { ButtonLoading } = useAnimatedComponents()
  const createPINButtonRef = useRef<TouchableOpacity>(null)
  const [{ preventScreenCapture, PINScreensConfig }, Button, inlineMessages] = useServices([
    TOKENS.CONFIG,
    TOKENS.COMP_BUTTON,
    TOKENS.INLINE_ERRORS,
  ])

  const { PINValidations, validatePINEntry, inlineMessageField1, modalState, PINSecurity } =
    usePINValidation(PIN, prevPIN)
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
      marginBottom: 20,
    }
  })

  const passcodeCreate = useCallback(
    async (PIN: string) => {
      try {
        await setWalletPIN(PIN)
        setAuthenticated(true)
        // this dispatch finishes this step of onboarding and will cause a navigation
        dispatch({
          type: DispatchAction.DID_CONFIRM_PIN,
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

  const handleCreatePinTap = useCallback(async (p: string) => {
    setIsLoading(true)
    if (validatePINEntry(p, prevPIN)) {
      await passcodeCreate(p)
    }
    setIsLoading(false)
  }, [prevPIN, passcodeCreate, validatePINEntry, setIsLoading])

  const isContinueDisabled = useMemo((): boolean => {
    if (inlineMessages.enabled) {
      return false
    }
    return isLoading || PIN.length < minPINLength || prevPIN.length < minPINLength
  }, [isLoading, PIN, inlineMessages])

  return (
    <KeyboardView keyboardAvoiding={false}>
      <View style={style.screenContainer}>
        <View style={style.contentContainer}>
          <PINScreenTitleText header={t('PINCreate.Header')} subheader={t('PINCreate.Subheader')}/>
          <PINInput
            label={t('PINCreateConfirm.PINInputLabel')}
            onPINChanged={async (p: string) => {
              setPIN(p)
              if (p.length === maxPINLength && PINScreensConfig.useNewPINDesign) {
                Keyboard.dismiss()
                await handleCreatePinTap(p)
              }
            }}
            testID={testIdWithKey('EnterPIN')}
            accessibilityLabel={t('PINCreate.EnterPIN')}
            autoFocus={false}
            inlineMessage={inlineMessageField1}
          />
          {PINSecurity.displayHelper && <PINValidationHelper validations={PINValidations} />}
          {modalState.visible && (
            <AlertModal title={modalState.title} message={modalState.message} submit={modalState.onModalDismiss} />
          )}
        </View>
        {!PINScreensConfig.useNewPINDesign && <View style={style.controlsContainer}>
          <Button
            title={t('PINCreate.CreatePIN')}
            testID={testIdWithKey('CreatePIN')}
            accessibilityLabel={t('PINCreate.CreatePIN')}
            buttonType={ButtonType.Primary}
            disabled={isContinueDisabled}
            onPress={handleCreatePinTap}
            ref={createPINButtonRef}
          >
            {isLoading ? <ButtonLoading /> : null}
          </Button>
        </View>}
      </View>
    </KeyboardView>
  )
}

export default PINCreateConfirmation
