import { useNavigation } from '@react-navigation/core'
import { CommonActions } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useState, useRef } from 'react'
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
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

// eslint-disable-next-line import/no-named-as-default
import Button, { ButtonType } from '../components/buttons/Button'
import PINInput from '../components/inputs/PINInput'
import AlertModal from '../components/modals/AlertModal'
import KeyboardView from '../components/views/KeyboardView'
import { minPINLength } from '../constants'
import { useAnimatedComponents } from '../contexts/animated-components'
import { useAuth } from '../contexts/auth'
import { useConfiguration } from '../contexts/configuration'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { AuthenticateStackParams, Screens } from '../types/navigators'
import { PINCreationValidations, PINValidationsType } from '../utils/PINCreationValidation'
import { StatusBarStyles } from '../utils/luminance'
import { testIdWithKey } from '../utils/testable'

interface PINCreateProps {
  setAuthenticated: (status: boolean) => void
}

interface ModalState {
  visible: boolean
  title: string
  message: string
}

const PINCreate: React.FC<PINCreateProps> = ({ setAuthenticated }) => {
  const { setPIN: setWalletPIN } = useAuth()
  const [PIN, setPIN] = useState('')
  const [PINTwo, setPINTwo] = useState('')
  const [continueEnabled, setContinueEnabled] = useState(true)
  const [modalState, setModalState] = useState<ModalState>({
    visible: false,
    title: '',
    message: '',
  })
  const iconSize = 24
  const navigation = useNavigation<StackNavigationProp<AuthenticateStackParams>>()
  const [, dispatch] = useStore()
  const { t } = useTranslation()
  const { PINSecurity } = useConfiguration()

  const [PINOneValidations, setPINOneValidations] = useState<PINValidationsType[]>(
    PINCreationValidations(PIN, PINSecurity.rules)
  )

  const { ColorPallet, TextTheme } = useTheme()
  const { ButtonLoading } = useAnimatedComponents()
  const PINTwoInputRef = useRef<TextInput>()
  const createPINButtonRef = useRef<TouchableOpacity>()

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
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: Screens.UseBiometry }],
        })
      )
    } catch (e) {
      // TODO:(jl)
    }
  }

  const confirmEntry = async (PINOne: string, PINTwo: string) => {
    for (const validation of PINOneValidations) {
      if (validation.isInvalid) {
        setModalState({
          visible: true,
          title: t('PINCreate.InvalidPIN'),
          message: t(`PINCreate.Message.${validation.errorName}`),
        })
        return
      }
    }
    if (PINOne !== PINTwo) {
      setModalState({
        visible: true,
        title: t('PINCreate.InvalidPIN'),
        message: t('PINCreate.PINsDoNotMatch'),
      })
      return
    }

    await passcodeCreate(PINOne)
  }

  return (
    <KeyboardView>
      <StatusBar barStyle={StatusBarStyles.Light} />
      <View style={style.screenContainer}>
        <View style={style.contentContainer}>
          <Text style={[TextTheme.normal, { marginBottom: 16 }]}>
            <Text style={{ fontWeight: 'bold' }}>{t('PINCreate.RememberPIN')}</Text> {t('PINCreate.PINDisclaimer')}
          </Text>
          <PINInput
            label={t('PINCreate.EnterPINTitle')}
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
            label={t('PINCreate.ReenterPIN')}
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
            accessibilityLabel={t('PINCreate.ReenterPIN')}
            autoFocus={false}
            ref={PINTwoInputRef}
          />
          {modalState.visible && (
            <AlertModal
              title={modalState.title}
              message={modalState.message}
              submit={() => setModalState({ ...modalState, visible: false })}
            />
          )}
        </View>
        <View style={style.controlsContainer}>
          <Button
            title={t('PINCreate.CreatePIN')}
            testID={testIdWithKey('CreatePIN')}
            accessibilityLabel={t('PINCreate.CreatePIN')}
            buttonType={ButtonType.Primary}
            disabled={!continueEnabled}
            onPress={async () => {
              await confirmEntry(PIN, PINTwo)
            }}
            ref={createPINButtonRef}
          >
            {!continueEnabled && <ButtonLoading />}
          </Button>
        </View>
      </View>
    </KeyboardView>
  )
}

export default PINCreate
