import { StackScreenProps } from '@react-navigation/stack'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DeviceEventEmitter, StyleSheet, TouchableOpacity, View } from 'react-native'

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
import VerifyPINModal from '../components/modals/VerifyPINModal'
import { BifoldError } from '../types/error'
import { Screens, SettingStackParams } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'
import { PINEntryUsage } from './PINVerify'
import ConfirmPINModal, { ConfirmPINModalUsage } from '../components/modals/ConfirmPINModal'
import { useAppAgent } from '../utils/agent'
import { HistoryCardType, HistoryRecord } from '../modules/history/types'
import { useAuth } from '../contexts/auth'
import { useStore } from '../contexts/store'

const PINChange: React.FC<StackScreenProps<SettingStackParams, Screens.ChangePIN>> = ({ navigation }) => {
  const { checkWalletPIN, rekeyWallet } = useAuth()
  const { agent } = useAppAgent()
  const [PIN, setPIN] = useState('')
  const [PINTwo, setPINTwo] = useState<string>('')
  const [PINOld, setPINOld] = useState('')
  const [store] = useStore()
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useTranslation()
  const { ColorPalette } = useTheme()
  const { ButtonLoading } = useAnimatedComponents()
  const createPINButtonRef = useRef<TouchableOpacity>(null)

  const [
    Button,
    inlineMessages,
    logger,
    historyManagerCurried,
    historyEnabled,
    historyEventsLogger,
    { preventScreenCapture, PINScreensConfig },
    PINHeader,
  ] = useServices([
    TOKENS.COMP_BUTTON,
    TOKENS.INLINE_ERRORS,
    TOKENS.UTIL_LOGGER,
    TOKENS.FN_LOAD_HISTORY,
    TOKENS.HISTORY_ENABLED,
    TOKENS.HISTORY_EVENTS_LOGGER,
    TOKENS.CONFIG,
    TOKENS.COMPONENT_PIN_HEADER,
  ])

  const [verifyPINModalVisible, setVerifyPINModalVisible] = useState(PINScreensConfig.useNewPINDesign)
  const [confirmPINModalVisible, setPINConfirmModalVisible] = useState(false)

  const {
    PINValidations,
    validatePINEntry,
    inlineMessageField1,
    inlineMessageField2,
    modalState,
    PINSecurity,
    clearModal,
    setModalState,
    comparePINEntries,
  } = usePINValidation(PIN)
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
    loadingContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
  })

  const onVerifyPINModalBackPressed = useCallback(() => {
    navigation.pop()
  }, [navigation])

  const onConfirmPINModalBackPressed = useCallback(() => {
    setPINConfirmModalVisible(false)
  }, [setPINConfirmModalVisible])

  const onAuthenticationComplete = useCallback(
    (pin: string) => {
      setPINOld(pin)
      setVerifyPINModalVisible(false)
    },
    [setPINOld, setVerifyPINModalVisible]
  )

  const onCancelAuth = useCallback(() => {
    navigation.navigate(Screens.Settings)
  }, [navigation])

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
          `[${PINChange.name}]:[logHistoryRecord] Skipping history log, either history function disabled or agent undefined`
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
      logger.error(`[${PINChange.name}]:[logHistoryRecord] Error saving history: ${err}`)
    }
  }, [agent, historyEnabled, logger, historyManagerCurried])

  const handleConfirmPINModal = async (userPinInput: string) => {
    try {
      setIsLoading(true)
      const valid = validatePINEntry(userPinInput, userPinInput)
      if (valid) {
        setPINConfirmModalVisible(true)
      }
    } catch (err: unknown) {
      const error = new BifoldError(t('Error.Title1049'), t('Error.Message1049'), (err as Error)?.message ?? err, 1049)
      DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePinTap = async () => {
    try {
      setIsLoading(true)
      const valid = validatePINEntry(PIN, PINTwo)
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

  const handleConfirmPIN = async (userPinInput: string) => {
    try {
      setIsLoading(true)
      const valid = comparePINEntries(PIN, userPinInput)
      if (valid) {
        const success = await rekeyWallet(agent, PINOld, PIN, store.preferences.useBiometry)
        if (success) {
          if (historyEventsLogger.logPinChanged) {
            logHistoryRecord()
          }
          if (PINScreensConfig.useNewPINDesign) {
            setPINConfirmModalVisible(false)
            navigation.navigate(Screens.ChangePINSuccess)
          } else {
            navigation.navigate(Screens.Settings)
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
    <KeyboardView keyboardAvoiding={true}>
      <View style={style.screenContainer}>
        <View style={style.contentContainer}>
          <PINHeader updatePin />
          {!PINScreensConfig.useNewPINDesign && (
            <PINInput
              label={t('PINChange.EnterOldPINTitle')}
              testID={testIdWithKey('EnterOldPIN')}
              accessibilityLabel={t('PINChange.EnterOldPIN')}
              onPINChanged={(p: string) => {
                setPINOld(p)
              }}
              onSubmitEditing={handleChangePinTap}
            />
          )}
          <PINInput
            label={t('PINChange.EnterPINTitle')}
            onPINChanged={async (userPinInput: string) => {
              setPIN(userPinInput)
              if (userPinInput.length === minPINLength && PINScreensConfig.useNewPINDesign) {
                await handleConfirmPINModal(userPinInput)
              }
            }}
            testID={testIdWithKey('EnterPIN')}
            accessibilityLabel={t('PINCreate.EnterPIN')}
            autoFocus={false}
            inlineMessage={inlineMessageField1}
            onSubmitEditing={handleChangePinTap}
          />
          {!PINScreensConfig.useNewPINDesign && (
            <PINInput
              label={t('PINCreateConfirm.PINInputLabel')}
              onPINChanged={async (userPinInput: string) => {
                setPINTwo(userPinInput)
              }}
              testID={testIdWithKey('ConfirmPIN')}
              accessibilityLabel={t('PINCreateConfirm.PINInputLabel')}
              autoFocus={false}
              inlineMessage={inlineMessageField2}
              onSubmitEditing={handleChangePinTap}
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
          </View>
        )}
      </View>
      <VerifyPINModal
        onAuthenticationComplete={onAuthenticationComplete}
        onBackPressed={onVerifyPINModalBackPressed}
        onCancelAuth={onCancelAuth}
        PINVerifyModalUsage={PINEntryUsage.ChangePIN}
        title={t('Screens.EnterPIN')}
        visible={verifyPINModalVisible}
      />
      <ConfirmPINModal
        errorModalState={modalState}
        isLoading={isLoading}
        modalUsage={ConfirmPINModalUsage.PIN_CHANGE}
        onBackPressed={onConfirmPINModalBackPressed}
        onConfirmPIN={handleConfirmPIN}
        PINOne={PIN}
        setPINTwo={setPINTwo}
        title={t('Screens.ConfirmPIN')}
        visible={confirmPINModalVisible}
      />
    </KeyboardView>
  )
}

export default PINChange
