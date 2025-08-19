import { ParamListBase } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DeviceEventEmitter, Keyboard, StyleSheet, View } from 'react-native'

// eslint-disable-next-line import/no-named-as-default
import PINInput from '../components/inputs/PINInput'
import PINValidationHelper from '../components/misc/PINValidationHelper'
import AlertModal from '../components/modals/AlertModal'
import KeyboardView from '../components/views/KeyboardView'
import PINScreenTitleText from '../components/misc/PINScreenTitleText'
import { EventTypes, maxPINLength } from '../constants'
import { TOKENS, useServices } from '../container-api'
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

const PINCreateConfirmation: React.FC<PINCreateConfirmationProps> = ({
  setAuthenticated,
  explainedStatus,
  prevPIN,
}) => {
  const { setPIN: setWalletPIN } = useAuth()
  const [PIN, setPIN] = useState('')
  const [, dispatch] = useStore()
  const { t } = useTranslation()

  const { ColorPalette } = useTheme()
  const [PINExplainer, { showPINExplainer, preventScreenCapture, PINScreensConfig }] = useServices([
    TOKENS.SCREEN_PIN_EXPLAINER,
    TOKENS.CONFIG,
  ])

  const [explained, setExplained] = useState(explainedStatus || showPINExplainer === false)
  const { PINValidations, validatePINEntry, inlineMessageField1, modalState, PINSecurity } = usePINValidation(
    PIN,
    prevPIN
  )
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
    },
  })

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

  const handleCreatePinTap = useCallback(async () => {
    if (validatePINEntry(PIN, prevPIN, true)) {
      await passcodeCreate(PIN)
    }
  }, [PIN, prevPIN, passcodeCreate, validatePINEntry])

  const continueCreatePIN = useCallback(() => {
    setExplained(true)
  }, [])

  return explained ? (
    <KeyboardView keyboardAvoiding={false}>
      <View style={style.screenContainer}>
        <View style={style.contentContainer}>
          <PINScreenTitleText header={t('PINCreate.Header')} subheader={t('PINCreate.Subheader')} />
          <PINInput
            label={t('PINCreateConfirm.PINInputLabel')}
            onPINChanged={async (p: string) => {
              setPIN(p)
              if (p.length === maxPINLength && PINScreensConfig.useNewPINDesign) {
                Keyboard.dismiss()
                await handleCreatePinTap()
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
      </View>
    </KeyboardView>
  ) : (
    <PINExplainer continueCreatePIN={continueCreatePIN} />
  )
}

export default PINCreateConfirmation
