import { ParamListBase, useNavigation } from '@react-navigation/native'
import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AccessibilityInfo,
  DeviceEventEmitter,
  findNodeHandle,
  Keyboard,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

// eslint-disable-next-line import/no-named-as-default
import { ButtonType } from '../components/buttons/Button-api'
import { InlineErrorType, InlineMessageProps } from '../components/inputs/InlineErrorText'
import PINInput from '../components/inputs/PINInput'
import AlertModal from '../components/modals/AlertModal'
import { ThemedText } from '../components/texts/ThemedText'
import KeyboardView from '../components/views/KeyboardView'
import { EventTypes, minPINLength } from '../constants'
import { TOKENS, useServices } from '../container-api'
import { useAnimatedComponents } from '../contexts/animated-components'
import { useAuth } from '../contexts/auth'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { HistoryCardType, HistoryRecord } from '../modules/history/types'
import { BifoldError } from '../types/error'
import { OnboardingStackParams, Screens } from '../types/navigators'
import { useAppAgent } from '../utils/agent'
import { createPINValidations, PINValidationsType } from '../utils/PINValidation'
import { testIdWithKey } from '../utils/testable'

interface ModalState {
  visible: boolean
  title: string
  message: string
  onModalDismiss?: () => void
}

const PINChange: React.FC<StackScreenProps<ParamListBase, Screens.ChangePIN>> = () => {
  const { agent } = useAppAgent()
  const { checkWalletPIN, rekeyWallet } = useAuth()
  const [PIN, setPIN] = useState('')
  const [PINTwo, setPINTwo] = useState('')
  const [PINOld, setPINOld] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [modalState, setModalState] = useState<ModalState>({
    visible: false,
    title: '',
    message: '',
  })
  const iconSize = 24
  const navigation = useNavigation<StackNavigationProp<OnboardingStackParams>>()
  const [store] = useStore()
  const { t } = useTranslation()
  const [inlineMessageField1, setInlineMessageField1] = useState<InlineMessageProps>()
  const [inlineMessageField2, setInlineMessageField2] = useState<InlineMessageProps>()
  const { ColorPallet } = useTheme()
  const { ButtonLoading } = useAnimatedComponents()
  const PINTwoInputRef = useRef<TextInput>(null)
  const createPINButtonRef = useRef<TouchableOpacity>(null)
  const [
    PINHeader,
    { PINSecurity },
    Button,
    inlineMessages,
    logger,
    historyManagerCurried,
    historyEnabled,
    historyEventsLogger,
  ] = useServices([
    TOKENS.COMPONENT_PIN_HEADER,
    TOKENS.CONFIG,
    TOKENS.COMP_BUTTON,
    TOKENS.INLINE_ERRORS,
    TOKENS.UTIL_LOGGER,
    TOKENS.FN_LOAD_HISTORY,
    TOKENS.HISTORY_ENABLED,
    TOKENS.HISTORY_EVENTS_LOGGER,
  ])
  const [PINOneValidations, setPINOneValidations] = useState<PINValidationsType[]>(
    createPINValidations(PIN, PINSecurity.rules)
  )

  const style = StyleSheet.create({
    screenContainer: {
      height: '100%',
      backgroundColor: ColorPallet.brand.primaryBackground,
      padding: 20,
      justifyContent: 'space-between',
    },

    // below used as helpful labels for views, no properties needed atp
    contentContainer: {},
    controlsContainer: {},
  })

  const attentionMessage = useCallback(
    (title: string, message: string, pinOne: boolean) => {
      if (inlineMessages.enabled) {
        const config = {
          message: message,
          inlineType: InlineErrorType.error,
          config: inlineMessages,
        }
        if (pinOne) {
          setInlineMessageField1(config)
        } else {
          setInlineMessageField2(config)
        }
      } else {
        setModalState({
          visible: true,
          title: title,
          message: message,
        })
      }
    },
    [inlineMessages]
  )

  const validatePINEntry = useCallback(
    (PINOne: string, PINTwo: string): boolean => {
      for (const validation of PINOneValidations) {
        if (validation.isInvalid) {
          attentionMessage(
            t('PINCreate.InvalidPIN'),
            t(`PINCreate.Message.${validation.errorName}`, validation?.errorTextAddition),
            true
          )
          return false
        }
      }
      if (PINOne !== PINTwo) {
        attentionMessage(t('PINCreate.InvalidPIN'), t('PINCreate.PINsDoNotMatch'), false)
        return false
      }
      return true
    },
    [PINOneValidations, t, attentionMessage]
  )

  const checkOldPIN = useCallback(
    async (PIN: string): Promise<boolean> => {
      const valid = await checkWalletPIN(PIN)
      if (!valid) {
        setModalState({
          visible: true,
          title: t('PINCreate.InvalidPIN'),
          message: t(`PINCreate.Message.OldPINIncorrect`),
        })
      }
      return valid
    },
    [checkWalletPIN, t]
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

    return PIN === '' || PINTwo === '' || PINOld === '' || PIN.length < minPINLength || PINTwo.length < minPINLength
  }, [inlineMessages, isLoading, PIN, PINTwo, PINOld])

  useEffect(() => {
    setInlineMessageField1(undefined)
    setInlineMessageField2(undefined)
  }, [PIN, PINTwo])

  return (
    <KeyboardView>
      <View style={style.screenContainer}>
        <View style={style.contentContainer}>
          <PINHeader updatePin />
          <PINInput
            label={t('PINChange.EnterOldPINTitle')}
            testID={testIdWithKey('EnterOldPIN')}
            accessibilityLabel={t('PINChange.EnterOldPIN')}
            onPINChanged={(p: string) => {
              setPINOld(p)
            }}
          />
          <PINInput
            label={t('PINChange.EnterPINTitle')}
            onPINChanged={(p: string) => {
              setPIN(p)
              setPINOneValidations(createPINValidations(p, PINSecurity.rules))

              if (p.length === minPINLength) {
                if (PINTwoInputRef?.current) {
                  PINTwoInputRef.current.focus()
                  // NOTE:(jl) `findNodeHandle` will be deprecated in React 18.
                  // https://reactnative.dev/docs/new-architecture-library-intro#preparing-your-javascript-codebase-for-the-new-react-native-renderer-fabric
                  const reactTag = findNodeHandle(PINTwoInputRef.current)
                  if (reactTag) {
                    AccessibilityInfo.setAccessibilityFocus(reactTag)
                  }
                }
              }
            }}
            testID={testIdWithKey('EnterPIN')}
            accessibilityLabel={t('PINCreate.EnterPIN')}
            autoFocus={false}
            inlineMessage={inlineMessageField1}
          />
          <PINInput
            label={t('PINChange.ReenterPIN')}
            onPINChanged={(p: string) => {
              setPINTwo(p)
              if (p.length === minPINLength) {
                Keyboard.dismiss()
                if (createPINButtonRef?.current) {
                  // NOTE:(jl) `findNodeHandle` will be deprecated in React 18.
                  // https://reactnative.dev/docs/new-architecture-library-intro#preparing-your-javascript-codebase-for-the-new-react-native-renderer-fabric
                  const reactTag = findNodeHandle(createPINButtonRef.current)
                  if (reactTag) {
                    AccessibilityInfo.setAccessibilityFocus(reactTag)
                  }
                }
              }
            }}
            testID={testIdWithKey('ReenterPIN')}
            accessibilityLabel={t('PINChange.ReenterPIN')}
            autoFocus={false}
            ref={PINTwoInputRef}
            inlineMessage={inlineMessageField2}
          />
          {PINSecurity.displayHelper && (
            <View style={{ marginBottom: 16 }}>
              {PINOneValidations.map((validation, index) => {
                return (
                  <View style={{ flexDirection: 'row' }} key={index}>
                    {validation.isInvalid ? (
                      <Icon
                        accessibilityLabel={t('PINCreate.Helper.ClearIcon')}
                        name="clear"
                        size={iconSize}
                        color={ColorPallet.notification.errorIcon}
                      />
                    ) : (
                      <Icon
                        accessibilityLabel={t('PINCreate.Helper.CheckIcon')}
                        name="check"
                        size={iconSize}
                        color={ColorPallet.notification.successIcon}
                      />
                    )}
                    <ThemedText style={{ paddingLeft: 4 }}>
                      {t(`PINCreate.Helper.${validation.errorName}`, validation?.errorTextAddition)}
                    </ThemedText>
                  </View>
                )
              })}
            </View>
          )}
          {modalState.visible && (
            <AlertModal
              title={modalState.title}
              message={modalState.message}
              submit={() => {
                modalState.onModalDismiss?.()
                setModalState({ ...modalState, visible: false, onModalDismiss: undefined })
              }}
            />
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

export default PINChange
