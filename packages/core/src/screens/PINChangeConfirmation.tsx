import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AccessibilityInfo,
  DeviceEventEmitter,
  findNodeHandle,
  StyleSheet,
  TextInput,
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
import { useAuth } from '../contexts/auth'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import usePreventScreenCapture from '../hooks/screen-capture'
import { usePINValidation } from '../hooks/usePINValidation'
import { HistoryCardType, HistoryRecord } from '../modules/history/types'
import { BifoldError } from '../types/error'
import { OnboardingStackParams, Screens } from '../types/navigators'
import { useAppAgent } from '../utils/agent'
import { testIdWithKey } from '../utils/testable'

type PINChangeConfirmationProps = {
  PINOne: string
  PINOld: string
}

const PINChangeConfirmation = ({ PINOne, PINOld }: PINChangeConfirmationProps) => {
  const { agent } = useAppAgent()
  const { checkWalletPIN, rekeyWallet } = useAuth()
  const [PIN, setPIN] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigation = useNavigation<StackNavigationProp<OnboardingStackParams>>()
  const [store] = useStore()
  const { t } = useTranslation()
  const { ColorPalette } = useTheme()
  const { ButtonLoading } = useAnimatedComponents()
  const PINTwoInputRef = useRef<TextInput>(null)
  const createPINButtonRef = useRef<TouchableOpacity>(null)

  const [
    PINHeader,
    Button,
    inlineMessages,
    logger,
    historyManagerCurried,
    historyEnabled,
    historyEventsLogger,
    { preventScreenCapture },
  ] = useServices([
    TOKENS.COMPONENT_PIN_HEADER,
    TOKENS.COMP_BUTTON,
    TOKENS.INLINE_ERRORS,
    TOKENS.UTIL_LOGGER,
    TOKENS.FN_LOAD_HISTORY,
    TOKENS.HISTORY_ENABLED,
    TOKENS.HISTORY_EVENTS_LOGGER,
    TOKENS.CONFIG,
  ])

  const { PINValidations, validatePINEntry, inlineMessageField1, modalState, setModalState, clearModal, PINSecurity } =
    usePINValidation(PINOne, PIN)
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

  const checkOldPIN = useCallback(
    async (PIN: string): Promise<boolean> => {
      const valid = await checkWalletPIN(PIN)
      if (!valid) {
        setModalState({
          visible: true,
          title: t('PINCreate.InvalidPIN'),
          message: t(`PINCreate.Message.OldPINIncorrect`),
          onModalDismiss: clearModal,
        })
      }
      return valid
    },
    [checkWalletPIN, t, setModalState, clearModal]
  )

  const logHistoryRecord = useCallback(() => {
    try {
      if (!(agent && historyEnabled)) {
        logger.trace(
          `[${PINChangeConfirmation.name}]:[logHistoryRecord] Skipping history log, either history function disabled or agent undefined`
        )
        return
      }
      const historyManager = historyManagerCurried(agent)
      /** Save history record for pin edited */
      const recordData: HistoryRecord = {
        type: HistoryCardType.PinChanged,
        message: HistoryCardType.PinChanged,
        createdAt: new Date(),
      }

      historyManager.saveHistory(recordData)
    } catch (err: unknown) {
      logger.error(`[${PINChangeConfirmation.name}]:[logHistoryRecord] Error saving history: ${err}`)
    }
  }, [agent, historyEnabled, logger, historyManagerCurried])

  const handleChangePinTap = async () => {
    try {
      setIsLoading(true)
      const valid = validatePINEntry(PINOne, PIN, true)
      if (valid) {
        const oldPinValid = await checkOldPIN(PINOld)
        if (oldPinValid) {
          const success = await rekeyWallet(agent, PINOld, PIN, store.preferences.useBiometry)
          if (success) {
            if (historyEventsLogger.logPinChanged) {
              logHistoryRecord()
            }

            setModalState({
              visible: true,
              title: t('PINChange.PinChangeSuccessTitle'),
              message: t('PINChange.PinChangeSuccessMessage'),
              onModalDismiss: () => {
                navigation.navigate(Screens.Settings as never)
                clearModal()
              },
            })
          }
        }
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
            onPINChanged={(p: string) => {
              setPIN(p)
              if (p.length === minPINLength && PINTwoInputRef?.current) {
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
            onSubmitEditing={handleChangePinTap}
          />
          {PINSecurity.displayHelper && <PINValidationHelper validations={PINValidations} />}
          {modalState.visible && (
            <AlertModal title={modalState.title} message={modalState.message} submit={modalState.onModalDismiss} />
          )}
        </View>
        <View style={style.controlsContainer}>
          <Button
            title={t('PINChange.ChangePIN')}
            testID={testIdWithKey('ChangePIN')}
            accessibilityLabel={t('PINChange.ChangePIN')}
            buttonType={ButtonType.Primary}
            disabled={isContinueDisabled}
            onPress={handleChangePinTap}
            ref={createPINButtonRef}
          >
            {isLoading ? <ButtonLoading /> : null}
          </Button>
        </View>
      </View>
    </KeyboardView>
  )
}

export default PINChangeConfirmation
