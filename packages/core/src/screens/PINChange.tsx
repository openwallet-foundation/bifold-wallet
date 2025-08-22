import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  DeviceEventEmitter,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'

import { ButtonType } from '../components/buttons/Button-api'
import PINInput from '../components/inputs/PINInput'
import PINValidationHelper from '../components/misc/PINValidationHelper'
import AlertModal from '../components/modals/AlertModal'
import KeyboardView from '../components/views/KeyboardView'
import { EventTypes, minPINLength } from '../constants'
import { TOKENS, useServices } from '../container-api'
import { useAnimatedComponents } from '../contexts/animated-components'
import { useTheme } from '../contexts/theme'
import usePreventScreenCapture from '../hooks/screen-capture'
import { usePINValidation } from '../hooks/usePINValidation'
import VerifyPINModal from '../modals/VerifyPINModal'
import { BifoldError } from '../types/error'
import { OnboardingStackParams, Screens, SettingStackParams } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'
import { PINEntryUsage } from './PINVerify'

const PINChange: React.FC<StackScreenProps<SettingStackParams, Screens.ChangePIN>> = () => {
  const [PIN, setPIN] = useState('')
  const [PINOld, setPINOld] = useState('')
  const [canSeeCheckPIN, setCanSeeCheckPIN] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const navigation = useNavigation<StackNavigationProp<OnboardingStackParams>>()
  const { t } = useTranslation()
  const { ColorPalette } = useTheme()
  const { ButtonLoading } = useAnimatedComponents()
  const createPINButtonRef = useRef<TouchableOpacity>(null)

  const [
    PINHeader,
    Button,
    inlineMessages,
    { preventScreenCapture, PINScreensConfig },
  ] = useServices([
    TOKENS.COMPONENT_PIN_HEADER,
    TOKENS.COMP_BUTTON,
    TOKENS.INLINE_ERRORS,
    TOKENS.CONFIG,
  ])

  const {
    PINValidations,
    validatePINEntry,
    inlineMessageField1,
    modalState,
    PINSecurity,
  } = usePINValidation(PIN, PIN)
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
  })

  const onBackPressed = useCallback(() => {
    navigation.pop()
  }, [navigation])

  const onAuthenticationComplete = useCallback((pin: string) => {
    setPINOld(pin)
    setCanSeeCheckPIN(false)
  }, [setPINOld, setCanSeeCheckPIN])

  const onCancelAuth = useCallback(() => {
    navigation.pop()
  }, [navigation])

  const handleChangePinTap = async () => {
    try {
      setIsLoading(true)
      const valid = validatePINEntry(PIN, PIN)
      if (valid) {
        navigation?.getParent()?.navigate(Screens.ChangePINConfirmation, { PIN, PINOld })
      }
    } catch (err: unknown) {
      const error = new BifoldError(t('Error.Title1049'), t('Error.Message1049'), (err as Error)?.message ?? err, 1049)
      DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
    } finally {
      setIsLoading(false)
    }
  }

  const isContinueDisabled = useMemo((): boolean => {
    if (inlineMessages || isLoading) {
      return false
    }
    return PIN === '' || PIN.length < minPINLength
  }, [inlineMessages, isLoading, PIN])

  return (
    <KeyboardView keyboardAvoiding={false}>
      <View style={style.screenContainer}>
        <View style={style.contentContainer}>
          <PINHeader updatePin />
          <PINInput
            label={t('PINChange.EnterPINTitle')}
            onPINChanged={async (p: string) => {
              setPIN(p)
              if (p.length === minPINLength && PINScreensConfig.useNewPINDesign) {
                await handleChangePinTap()
              }
            }}
            testID={testIdWithKey('EnterPIN')}
            accessibilityLabel={t('PINCreate.EnterPIN')}
            autoFocus={false}
            inlineMessage={inlineMessageField1}
            onSubmitEditing={handleChangePinTap}
          />
          {PINSecurity.displayHelper && <PINValidationHelper validations={PINValidations} />}
          {modalState.visible && (
            <AlertModal title={modalState.title} message={modalState.message} submit={modalState.onModalDismiss} />
          )}
        </View>
        {!PINScreensConfig.useNewPINDesign && <View style={style.controlsContainer}>
          <Button
            title={t('PINChange.ChangePIN')}
            testID={testIdWithKey('ChangePIN')}
            accessibilityLabel={t('Global.Continue')}
            buttonType={ButtonType.Primary}
            disabled={isContinueDisabled}
            onPress={handleChangePinTap}
            ref={createPINButtonRef}
          >
            {isLoading ? <ButtonLoading /> : null}
          </Button>
        </View>}
      </View>
      <VerifyPINModal
        onAuthenticationComplete={onAuthenticationComplete}
        onBackPressed={onBackPressed}
        onCancelAuth={onCancelAuth}
        PINVerifyModalUsage={PINEntryUsage.ChangePIN}
        title={t('Screens.EnterPIN')}
        visible={canSeeCheckPIN}
      />
    </KeyboardView>
  )
}

export default PINChange
