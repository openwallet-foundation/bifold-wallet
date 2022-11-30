import { useNavigation } from '@react-navigation/core'
import { StackNavigationProp } from '@react-navigation/stack'
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
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'

import Button, { ButtonType } from '../components/buttons/Button'
import PinInput from '../components/inputs/PinInput'
import AlertModal from '../components/modals/AlertModal'
import { minPINLength } from '../constants'
import { useAuth } from '../contexts/auth'
import { useConfiguration } from '../contexts/configuration'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { AuthenticateStackParams, Screens } from '../types/navigators'
import { StatusBarStyles } from '../utils/luminance'
import { pinCreationValidations, PinValidationsType } from '../utils/pinCreationValidation'
import { testIdWithKey } from '../utils/testable'

interface PinCreateProps {
  setAuthenticated: (status: boolean) => void
}

interface ModalState {
  visible: boolean
  title: string
  message: string
}

const PinCreate: React.FC<PinCreateProps> = ({ setAuthenticated }) => {
  const { setPIN } = useAuth()
  const [pin, setPin] = useState('')
  const [pinTwo, setPinTwo] = useState('')
  const [continueEnabled, setContinueEnabled] = useState(true)
  const [modalState, setModalState] = useState<ModalState>({
    visible: false,
    title: '',
    message: '',
  })
  const [pinOneValidations, setPinOneValidations] = useState<PinValidationsType[]>([])

  const navigation = useNavigation<StackNavigationProp<AuthenticateStackParams>>()
  const [, dispatch] = useStore()
  const { t } = useTranslation()
  const { pinSecurity } = useConfiguration()

  const { ColorPallet, TextTheme } = useTheme()
  const pinTwoInputRef = useRef<TextInput>()
  const createPinButtonRef = useRef<TouchableOpacity>()

  const style = StyleSheet.create({
    container: {
      height: '100%',
      backgroundColor: ColorPallet.brand.primaryBackground,
      padding: 20,
    },
  })

  const passcodeCreate = async (pin: string) => {
    // TODO: Update this
    try {
      setContinueEnabled(false)
      await setPIN(pin)
      // This will trigger initAgent
      setAuthenticated(true)

      dispatch({
        type: DispatchAction.DID_CREATE_PIN,
      })

      // TODO: Navigate back if in settings
      navigation.navigate(Screens.UseBiometry)
    } catch (e) {
      // TODO:(jl)
    }
  }

  const confirmEntry = async (pinX: string, pinY: string) => {
    for (const validation of pinOneValidations) {
      if (validation.isInvalid) {
        setModalState({
          visible: true,
          title: t('PinCreate.InvalidPIN'),
          message: t(`PinCreate.Message.${validation.errorName}`),
        })
        return
      }
    }
    if (pinX !== pinY) {
      setModalState({
        visible: true,
        title: t('PinCreate.InvalidPIN'),
        message: t('PinCreate.PINsDoNotMatch'),
      })
      return
    }

    await passcodeCreate(pinX)
  }

  // const r: ?React.ElementRef<typeof View>

  return (
    <SafeAreaView>
      <StatusBar barStyle={StatusBarStyles.Light} />
      <View style={[style.container]}>
        <Text style={[TextTheme.normal, { marginBottom: 16 }]}>
          <Text style={{ fontWeight: 'bold' }}>{t('PinCreate.RememberPIN')}</Text> {t('PinCreate.PINDisclaimer')}
        </Text>
        <PinInput
          label={t('PinCreate.EnterPINTitle')}
          onPinChanged={(p: string) => {
            setPin(p)

            setPinOneValidations(pinCreationValidations(p, pinSecurity.rules))

            if (p.length === minPINLength) {
              if (pinTwoInputRef && pinTwoInputRef.current) {
                pinTwoInputRef.current.focus()
                // NOTE:(jl) `findNodeHandle` will be deprecated in React 18.
                // https://reactnative.dev/docs/new-architecture-library-intro#preparing-your-javascript-codebase-for-the-new-react-native-renderer-fabric
                const reactTag = findNodeHandle(pinTwoInputRef.current)
                if (reactTag) {
                  AccessibilityInfo.setAccessibilityFocus(reactTag)
                }
              }
            }
          }}
          testID={testIdWithKey('EnterPIN')}
          accessibilityLabel={t('PinCreate.EnterPIN')}
          autoFocus={false}
        />
        {pinSecurity.displayHelper && (
          <View style={{ marginBottom: 16 }}>
            {pinOneValidations.map((validation, index) => {
              return (
                <View style={{ flexDirection: 'row' }} key={index}>
                  {validation.isInvalid ? (
                    <Icon name="clear" size={24} color={ColorPallet.notification.errorIcon} />
                  ) : (
                    <Icon name="check" size={24} color={ColorPallet.notification.success} />
                  )}
                  <Text style={[TextTheme.normal, { paddingLeft: 4 }]}>
                    {t(`PinCreate.Helper.${validation.errorName}`)}
                  </Text>
                </View>
              )
            })}
          </View>
        )}
        <PinInput
          label={t('PinCreate.ReenterPIN')}
          onPinChanged={(p: string) => {
            setPinTwo(p)

            if (p.length === minPINLength) {
              Keyboard.dismiss()
              if (createPinButtonRef && createPinButtonRef.current) {
                // NOTE:(jl) `findNodeHandle` will be deprecated in React 18.
                // https://reactnative.dev/docs/new-architecture-library-intro#preparing-your-javascript-codebase-for-the-new-react-native-renderer-fabric
                const reactTag = findNodeHandle(createPinButtonRef.current)
                if (reactTag) {
                  AccessibilityInfo.setAccessibilityFocus(reactTag)
                }
              }
            }
          }}
          testID={testIdWithKey('ReenterPIN')}
          accessibilityLabel={t('PinCreate.ReenterPIN')}
          autoFocus={false}
          ref={pinTwoInputRef}
        />
        {modalState.visible && (
          <AlertModal
            title={modalState.title}
            message={modalState.message}
            submit={() => setModalState({ ...modalState, visible: false })}
          />
        )}
      </View>
      <View style={{ marginTop: 'auto', margin: 20 }}>
        <Button
          title={t('PinCreate.CreatePIN')}
          testID={testIdWithKey('CreatePIN')}
          accessibilityLabel={t('PinCreate.CreatePIN')}
          buttonType={ButtonType.Primary}
          disabled={!continueEnabled}
          onPress={async () => {
            await confirmEntry(pin, pinTwo)
          }}
          ref={createPinButtonRef}
        />
      </View>
    </SafeAreaView>
  )
}

export default PinCreate
