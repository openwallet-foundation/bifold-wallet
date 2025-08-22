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
import { SettingStackParams } from '../types/navigators'

type PINChangeConfirmationProps = StackScreenProps<SettingStackParams, Screens.ChangePINConfirmation>

const PINChangeConfirmation: React.FC<PINChangeConfirmationProps> = ({ route }) => {
  const { agent } = useAppAgent()
  const { rekeyWallet } = useAuth()
  const [PIN, setPIN] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigation = useNavigation<StackNavigationProp<OnboardingStackParams>>()
  const [store] = useStore()
  const { t } = useTranslation()
  const { ColorPalette } = useTheme()
  const { ButtonLoading } = useAnimatedComponents()
  const createPINButtonRef = useRef<TouchableOpacity>(null)
  const { PINNew, PINOld } = route?.params

  const [
    Button,
    inlineMessages,
    logger,
    historyManagerCurried,
    historyEnabled,
    historyEventsLogger,
    { preventScreenCapture, PINScreensConfig },
  ] = useServices([
    TOKENS.COMP_BUTTON,
    TOKENS.INLINE_ERRORS,
    TOKENS.UTIL_LOGGER,
    TOKENS.FN_LOAD_HISTORY,
    TOKENS.HISTORY_ENABLED,
    TOKENS.HISTORY_EVENTS_LOGGER,
    TOKENS.CONFIG,
  ])

  const { PINValidations, validatePINEntry, inlineMessageField1, modalState, setModalState, clearModal, PINSecurity } =
    usePINValidation(PIN, PIN)
  usePreventScreenCapture(preventScreenCapture)

  const style = StyleSheet.create({
    screenContainer: {
      height: '100%',
      backgroundColor: ColorPalette.brand.primaryBackground,
      padding: 20,
      paddingTop: 40,
      justifyContent: 'space-between',
    },
  })

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

  const handleChangePin = async (p: string) => {
    try {
      setIsLoading(true)
      const valid = validatePINEntry(PINNew, p)
      if (valid) {
        const success = await rekeyWallet(agent, PINOld, PINNew, store.preferences.useBiometry)
        if (success) {
          if (historyEventsLogger.logPinChanged) {
            logHistoryRecord()
          }
          navigation.navigate(Screens.Settings as never)
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
        <View>
          <PINInput
            label={t('PINCreateConfirm.PINInputLabel')}
            onPINChanged={async (p: string) => {
              if(p.length === minPINLength) await handleChangePin(p)
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
        <View>
          {!PINScreensConfig.useNewPINDesign && <Button
            title={t('PINChange.ChangePIN')}
            testID={testIdWithKey('ChangePIN')}
            accessibilityLabel={t('PINChange.ChangePIN')}
            buttonType={ButtonType.Primary}
            disabled={isContinueDisabled}
            onPress={handleChangePin}
            ref={createPINButtonRef}
          >
            {isLoading ? <ButtonLoading /> : null}
          </Button>}
        </View>
      </View>
    </KeyboardView>
  )
}

export default PINChangeConfirmation
