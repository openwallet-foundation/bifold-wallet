import { CommonActions, useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  StyleSheet,
  Text,
  View,
  Modal,
  Switch,
  ScrollView,
  Pressable,
  DeviceEventEmitter,
  Animated,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'

import Button, { ButtonType } from '../components/buttons/Button'
import { EventTypes } from '../constants'
import { useAnimatedComponents } from '../contexts/animated-components'
import { useAuth } from '../contexts/auth'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { OnboardingStackParams, Screens } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

import PINEnter, { PINEntryUsage } from './PINEnter'
import { TOKENS, useServices } from '../container-api'

enum UseBiometryUsage {
  InitialSetup,
  ToggleOnOff,
}

const UseBiometry: React.FC = () => {
  const [store, dispatch] = useStore()
  const { t } = useTranslation()
  const [{ enablePushNotifications }] = useServices([TOKENS.CONFIG])
  const { isBiometricsActive, commitPIN, disableBiometrics } = useAuth()
  const [biometryAvailable, setBiometryAvailable] = useState(false)
  const [biometryEnabled, setBiometryEnabled] = useState(store.preferences.useBiometry)
  const [continueEnabled, setContinueEnabled] = useState(true)
  const [canSeeCheckPIN, setCanSeeCheckPIN] = useState<boolean>(false)
  const { ColorPallet, TextTheme, Assets } = useTheme()
  const [toggleAnim] = useState(new Animated.Value(biometryEnabled ? 1 : 0))
  const { ButtonLoading } = useAnimatedComponents()
  const navigation = useNavigation<StackNavigationProp<OnboardingStackParams>>()
  const screenUsage = useMemo(() => {
    return store.onboarding.didCompleteOnboarding ? UseBiometryUsage.ToggleOnOff : UseBiometryUsage.InitialSetup
  }, [store.onboarding.didCompleteOnboarding])

  const styles = StyleSheet.create({
    container: {
      height: '100%',
      padding: 20,
      backgroundColor: ColorPallet.brand.primaryBackground,
    },
    image: {
      minWidth: 200,
      minHeight: 200,
      marginBottom: 66,
    },
  })

  useEffect(() => {
    isBiometricsActive().then((result) => {
      setBiometryAvailable(result)
    })
  }, [isBiometricsActive])

  useEffect(() => {
    if (screenUsage === UseBiometryUsage.InitialSetup) {
      return
    }

    if (biometryEnabled) {
      commitPIN(biometryEnabled).then(() => {
        dispatch({
          type: DispatchAction.USE_BIOMETRY,
          payload: [biometryEnabled],
        })
      })
    } else {
      disableBiometrics().then(() => {
        dispatch({
          type: DispatchAction.USE_BIOMETRY,
          payload: [biometryEnabled],
        })
      })
    }
  }, [screenUsage, biometryEnabled, commitPIN, disableBiometrics, dispatch])

  const continueTouched = useCallback(async () => {
    setContinueEnabled(false)

    await commitPIN(biometryEnabled)

    dispatch({
      type: DispatchAction.USE_BIOMETRY,
      payload: [biometryEnabled],
    })
    if (enablePushNotifications) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: Screens.UsePushNotifications }],
        })
      )
    } else {
      dispatch({ type: DispatchAction.DID_COMPLETE_ONBOARDING, payload: [true] })
    }
  }, [biometryEnabled, commitPIN, dispatch, enablePushNotifications, navigation])

  const toggleSwitch = useCallback(() => {
    // If the user is toggling biometrics on/off they need
    // to first authenticate before this action is accepted
    if (screenUsage === UseBiometryUsage.ToggleOnOff) {
      setCanSeeCheckPIN(true)
      DeviceEventEmitter.emit(EventTypes.BIOMETRY_UPDATE, true)
      return
    }

    setBiometryEnabled((previousState) => !previousState)
  }, [screenUsage])

  const handleToggle = () => {
    Animated.timing(toggleAnim, {
      toValue: biometryEnabled ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
    }).start()
    toggleSwitch()
  }

  const backgroundColor = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [ColorPallet.grayscale.lightGrey, ColorPallet.brand.primaryDisabled],
  })

  const translateX = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 25],
  })

  const onAuthenticationComplete = useCallback((status: boolean) => {
    // If successfully authenticated the toggle may proceed.
    if (status) {
      setBiometryEnabled((previousState) => !previousState)
    }
    DeviceEventEmitter.emit(EventTypes.BIOMETRY_UPDATE, false)
    setCanSeeCheckPIN(false)
  }, [])

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']}>
      <ScrollView style={styles.container}>
        <View style={{ alignItems: 'center' }}>
          <Assets.svg.biometrics style={styles.image} />
        </View>
        {biometryAvailable ? (
          <View>
            <Text style={TextTheme.normal}>{t('Biometry.EnabledText1')}</Text>
            <Text></Text>
            <Text style={TextTheme.normal}>
              {t('Biometry.EnabledText2')}
              <Text style={TextTheme.bold}> {t('Biometry.Warning')}</Text>
            </Text>
          </View>
        ) : (
          <View>
            <Text style={TextTheme.normal}>{t('Biometry.NotEnabledText1')}</Text>
            <Text></Text>
            <Text style={TextTheme.normal}>{t('Biometry.NotEnabledText2')}</Text>
          </View>
        )}
        <View
          style={{
            flexDirection: 'row',
            marginVertical: 20,
          }}
        >
          <View style={{ flexShrink: 1, marginRight: 10, justifyContent: 'center' }}>
            <Text style={TextTheme.bold}>{t('Biometry.UseToUnlock')}</Text>
          </View>
          <View style={{ justifyContent: 'center' }}>
            <Pressable
              testID={testIdWithKey('ToggleBiometrics')}
              accessible
              accessibilityLabel={t('Biometry.Toggle')}
              accessibilityRole={'switch'}
              onPress={handleToggle}
              disabled={!biometryAvailable}
            >
              <Animated.View
                style={{
                  width: 55,
                  height: 30,
                  borderRadius: 25,
                  backgroundColor,
                  padding: 3,
                  justifyContent: 'center',
                }}
              >
                <Animated.View
                  style={{
                    transform: [{ translateX }],
                    width: 25,
                    height: 25,
                    borderRadius: 20,
                    backgroundColor: ColorPallet.brand.secondary,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {biometryEnabled ? (
                    <Icon name="check" size={15} color={ColorPallet.brand.primary} />
                  ) : (
                    <Icon name="close" size={15} color={ColorPallet.grayscale.mediumGrey} />
                  )}
                </Animated.View>
              </Animated.View>
            </Pressable>
          </View>
        </View>
      </ScrollView>
      <View style={{ marginTop: 'auto', margin: 20 }}>
        {store.onboarding.didCompleteOnboarding || (
          <Button
            title={'Continue'}
            accessibilityLabel={'Continue'}
            testID={testIdWithKey('Continue')}
            onPress={continueTouched}
            buttonType={ButtonType.Primary}
            disabled={!continueEnabled}
          >
            {!continueEnabled && <ButtonLoading />}
          </Button>
        )}
      </View>
      <Modal
        style={{ backgroundColor: ColorPallet.brand.primaryBackground }}
        visible={canSeeCheckPIN}
        transparent={false}
        animationType={'slide'}
      >
        <PINEnter usage={PINEntryUsage.PINCheck} setAuthenticated={onAuthenticationComplete} />
      </Modal>
    </SafeAreaView>
  )
}

export default UseBiometry
