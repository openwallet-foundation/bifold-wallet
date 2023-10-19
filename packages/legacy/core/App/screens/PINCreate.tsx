import { ParamListBase, useNavigation } from '@react-navigation/core'
import { CommonActions } from '@react-navigation/native'
import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack'
import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AccessibilityInfo,
  Keyboard,
  StyleSheet,
  Text,
  StatusBar,
  View,
  TextInput,
  TouchableOpacity,
  findNodeHandle,
  DeviceEventEmitter,
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

// eslint-disable-next-line import/no-named-as-default
import Button, { ButtonType } from '../components/buttons/Button'
import PINInput from '../components/inputs/PINInput'
import AlertModal from '../components/modals/AlertModal'
import KeyboardView from '../components/views/KeyboardView'
import { EventTypes, minPINLength } from '../constants'
import { useAnimatedComponents } from '../contexts/animated-components'
import { useAuth } from '../contexts/auth'
import { useConfiguration } from '../contexts/configuration'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { BifoldError } from '../types/error'
import { AuthenticateStackParams, Screens } from '../types/navigators'
import { PINCreationValidations, PINValidationsType } from '../utils/PINCreationValidation'
import { StatusBarStyles } from '../utils/luminance'
import { testIdWithKey } from '../utils/testable'

interface PINCreateProps extends StackScreenProps<ParamListBase, Screens.CreatePIN> {
  setAuthenticated: (status: boolean) => void
}

interface ModalState {
  visible: boolean
  title: string
  message: string
  onModalDismiss?: () => void
}

const PINCreate: React.FC<PINCreateProps> = ({ setAuthenticated, route }) => {
  const updatePin = (route.params as any)?.updatePin
  const { setPIN: setWalletPIN, checkPIN, rekeyWallet } = useAuth()
  const [PIN, setPIN] = useState('')
  const [PINTwo, setPINTwo] = useState('')
  const [PINOld, setPINOld] = useState('')
  const [continueEnabled, setContinueEnabled] = useState(true)
  const [isLoading, setLoading] = useState(false)
  const [modalState, setModalState] = useState<ModalState>({
    visible: false,
    title: '',
    message: '',
  })
  const iconSize = 24
  const navigation = useNavigation<StackNavigationProp<AuthenticateStackParams>>()
  const [store, dispatch] = useStore()
  const { t } = useTranslation()
  const { PINSecurity } = useConfiguration()

  const [PINOneValidations, setPINOneValidations] = useState<PINValidationsType[]>(
    PINCreationValidations(PIN, PINSecurity.rules)
  )

  const { ColorPallet, TextTheme } = useTheme()
  const { ButtonLoading } = useAnimatedComponents()
  const PINTwoInputRef = useRef<TextInput>(null)
  const createPINButtonRef = useRef<TouchableOpacity>(null)
  const actionButtonLabel = updatePin ? t('PINCreate.ChangePIN') : t('PINCreate.CreatePIN')
  const actionButtonTestId = updatePin ? testIdWithKey('ChangePIN') : testIdWithKey('CreatePIN')

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

  const passcodeCreate = async (PIN: string) => {
    try {
      setContinueEnabled(false)
      await setWalletPIN(PIN)
      // This will trigger initAgent
      setAuthenticated(true)

      dispatch({
        type: DispatchAction.DID_CREATE_PIN,
      })

      // TODO: Navigate back if in settings
      if (store.preferences.enableWalletNaming) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: Screens.NameWallet }],
          })
        )
      } else {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: Screens.UseBiometry }],
          })
        )
      }
    } catch (err: unknown) {
      const error = new BifoldError(t('Error.Title1040'), t('Error.Message1040'), (err as Error)?.message ?? err, 1040)
      DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
    }
  }

  const validatePINEntry = (PINOne: string, PINTwo: string): boolean => {
    for (const validation of PINOneValidations) {
      if (validation.isInvalid) {
        setModalState({
          visible: true,
          title: t('PINCreate.InvalidPIN'),
          message: t(`PINCreate.Message.${validation.errorName}`),
        })
        return false
      }
    }
    if (PINOne !== PINTwo) {
      setModalState({
        visible: true,
        title: t('PINCreate.InvalidPIN'),
        message: t('PINCreate.PINsDoNotMatch'),
      })
      return false
    }
    return true
  }

  const checkOldPIN = async (PIN: string): Promise<boolean> => {
    const valid = await checkPIN(PIN)
    if (!valid) {
      setModalState({
        visible: true,
        title: t('PINCreate.InvalidPIN'),
        message: t(`PINCreate.Message.OldPINIncorrect`),
      })
    }
    return valid
  }

  const confirmEntry = async (PINOne: string, PINTwo: string) => {
    if (!validatePINEntry(PINOne, PINTwo)) {
      return
    }

    await passcodeCreate(PINOne)
  }
  useEffect(() => {
    if (updatePin) {
      setContinueEnabled(PIN !== '' && PINTwo !== '' && PINOld !== '')
    }
  }, [PINOld, PIN, PINTwo])

  return (
    <KeyboardView>
      <StatusBar barStyle={StatusBarStyles.Light} />
      <View style={style.screenContainer}>
        <View style={style.contentContainer}>
          <Text style={[TextTheme.normal, { marginBottom: 16 }]}>
            <Text style={{ fontWeight: 'bold' }}>
              {updatePin ? t('PINCreate.RememberChangePIN') : t('PINCreate.RememberPIN')}
            </Text>{' '}
            {t('PINCreate.PINDisclaimer')}
          </Text>
          {updatePin && (
            <PINInput
              label={t('PINCreate.EnterOldPINTitle')}
              testID={testIdWithKey('EnterOldPIN')}
              onPINChanged={(p: string) => {
                setPINOld(p)
              }}
            />
          )}
          <PINInput
            label={t('PINCreate.EnterPINTitle', { new: updatePin ? t('PINCreate.NewPIN') + ' ' : '' })}
            onPINChanged={(p: string) => {
              setPIN(p)
              setPINOneValidations(PINCreationValidations(p, PINSecurity.rules))

              if (p.length === minPINLength) {
                if (PINTwoInputRef && PINTwoInputRef.current) {
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
          />
          {PINSecurity.displayHelper && (
            <View style={{ marginBottom: 16 }}>
              {PINOneValidations.map((validation, index) => {
                return (
                  <View style={{ flexDirection: 'row' }} key={index}>
                    {validation.isInvalid ? (
                      <Icon name="clear" size={iconSize} color={ColorPallet.notification.errorIcon} />
                    ) : (
                      <Icon name="check" size={iconSize} color={ColorPallet.notification.successIcon} />
                    )}
                    <Text style={[TextTheme.normal, { paddingLeft: 4 }]}>
                      {t(`PINCreate.Helper.${validation.errorName}`)}
                    </Text>
                  </View>
                )
              })}
            </View>
          )}
          <PINInput
            label={t('PINCreate.ReenterPIN', { new: updatePin ? t('PINCreate.NewPIN') + ' ' : '' })}
            onPINChanged={(p: string) => {
              setPINTwo(p)
              if (p.length === minPINLength) {
                Keyboard.dismiss()
                if (createPINButtonRef && createPINButtonRef.current) {
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
            accessibilityLabel={t('PINCreate.ReenterPIN', { new: updatePin ? t('PINCreate.NewPIN') + ' ' : '' })}
            autoFocus={false}
            ref={PINTwoInputRef}
          />
          {modalState.visible && (
            <AlertModal
              title={modalState.title}
              message={modalState.message}
              submit={() => {
                if (modalState.onModalDismiss) {
                  modalState.onModalDismiss()
                }
                setModalState({ ...modalState, visible: false, onModalDismiss: undefined })
              }}
            />
          )}
        </View>
        <View style={style.controlsContainer}>
          <Button
            title={actionButtonLabel}
            testID={actionButtonTestId}
            accessibilityLabel={actionButtonLabel}
            buttonType={ButtonType.Primary}
            disabled={!continueEnabled}
            onPress={async () => {
              setLoading(true)
              if (updatePin) {
                const valid = validatePINEntry(PIN, PINTwo)
                if (valid) {
                  setContinueEnabled(false)
                  const oldPinValid = await checkOldPIN(PINOld)
                  if (oldPinValid) {
                    const success = await rekeyWallet(PINOld, PIN, store.preferences.useBiometry)
                    if (success) {
                      setModalState({
                        visible: true,
                        title: t('PINCreate.PinChangeSuccessTitle'),
                        message: t('PINCreate.PinChangeSuccessMessage'),
                        onModalDismiss: () => {
                          navigation.navigate(Screens.Settings as never)
                        },
                      })
                    }
                  }
                  setContinueEnabled(true)
                }
              } else {
                await confirmEntry(PIN, PINTwo)
              }
              setLoading(false)
            }}
            ref={createPINButtonRef}
          >
            {!continueEnabled && isLoading ? <ButtonLoading /> : null}
          </Button>
        </View>
      </View>
    </KeyboardView>
  )
}

export default PINCreate
