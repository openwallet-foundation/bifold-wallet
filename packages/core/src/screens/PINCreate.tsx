import { ParamListBase, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
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
import { maxPINLength, minPINLength } from '../constants'
import { TOKENS, useServices } from '../container-api'
import { useAnimatedComponents } from '../contexts/animated-components'
import { useTheme } from '../contexts/theme'
import usePreventScreenCapture from '../hooks/screen-capture'
import { usePINValidation } from '../hooks/usePINValidation'
import { Screens } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'
import PINScreenTitleText from '../components/misc/PINScreenTitleText'
import { StackNavigationProp } from '@react-navigation/stack'
import { OnboardingStackParams } from '../types/navigators'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'

interface PINCreateProps extends StackScreenProps<ParamListBase, Screens.CreatePIN> {
  setAuthenticated: (status: boolean) => void
  explainedStatus: boolean
}

const PINCreate: React.FC<PINCreateProps> = ({ explainedStatus }) => {
  const [, dispatch] = useStore()
  const [PIN, setPIN] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useTranslation()
  const navigation = useNavigation<StackNavigationProp<OnboardingStackParams>>()
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

  const [explained, setExplained] = useState(explainedStatus || showPINExplainer === false)
  const { PINValidations, validatePINEntry, inlineMessageField1, modalState, PINSecurity } =
    usePINValidation(PIN, PIN)
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
      if (PINScreensConfig.useNewPINDesign && validatePINEntry(pin, pin)) {
        dispatch({
          type: DispatchAction.DID_CREATE_PIN,
          payload: [pin],
        })
      }
    },
    [validatePINEntry, navigation, setIsLoading, PINScreensConfig.useNewPINDesign]
  )

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
    <KeyboardView keyboardAvoiding={false}>
      <View style={style.screenContainer}>
        <View style={style.contentContainer}>
          <PINScreenTitleText header={t('PINCreate.Header')} subheader={t('PINCreate.Subheader')} />
          <PINHeader />
          <PINInput
            label={t('PINCreate.EnterPINTitle')}
            onPINChanged={async (p: string) => {
              setPIN(p)
              if (p.length === maxPINLength && PINScreensConfig.useNewPINDesign) {
                Keyboard.dismiss()
                await handleConfirmPINFlow(p)
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
        {!PINScreensConfig.useNewPINDesign && (
          <View style={style.controlsContainer}>
            <Button
              title={t('PINCreate.CreatePIN')}
              testID={testIdWithKey('CreatePIN')}
              accessibilityLabel={t('PINCreate.CreatePIN')}
              buttonType={ButtonType.Primary}
              disabled={isContinueDisabled}
              onPress={handleConfirmPINFlow}
              ref={createPINButtonRef}
            >
              {isLoading ? <ButtonLoading /> : null}
            </Button>
          </View>
        )}
      </View>
    </KeyboardView>
  ) : (
    <PINExplainer continueCreatePIN={continueCreatePIN} />
  )
}

export default PINCreate
