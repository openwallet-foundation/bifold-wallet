import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View, Switch, StatusBar, Platform, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import Biometrics from '../assets/img/biometrics.svg'
import Button, { ButtonType } from '../components/buttons/Button'
import { useAuth } from '../contexts/auth'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { statusBarStyleForColor, StatusBarStyles } from '../utils/luminance'
import { testIdWithKey } from '../utils/testable'

import CheckPin, { Action } from './CheckPin'

const UseBiometry: React.FC = () => {
  const [store, dispatch] = useStore()
  const { t } = useTranslation()
  const { isBiometricsActive, commitPIN } = useAuth()
  const [biometryAvailable, setBiometryAvailable] = useState(false)
  const [biometryEnabled, setBiometryEnabled] = useState(store.preferences.useBiometry)
  const [continueEnabled, setContinueEnabled] = useState(true)
  const [canSeeCheckPin, setCanSeeCheckPin] = React.useState<boolean>(false)
  const { ColorPallet, TextTheme } = useTheme()
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
  }, [])

  useEffect(() => {
    if (store.onboarding.didConsiderBiometry && store.preferences.useBiometry !== biometryEnabled) {
      setCanSeeCheckPin(true)

      dispatch({
        type: DispatchAction.USE_BIOMETRY,
        payload: [biometryEnabled],
      })
    }
  }, [biometryEnabled])

  const continueTouched = async () => {
    setContinueEnabled(false)

    await commitPIN(biometryEnabled)

    dispatch({
      type: DispatchAction.USE_BIOMETRY,
      payload: [biometryEnabled],
    })
  }

  const toggleSwitch = () => setBiometryEnabled((previousState) => !previousState)

  const blarb = () => {
    setCanSeeCheckPin(false)
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']}>
      <StatusBar
        barStyle={Platform.OS === 'android' ? StatusBarStyles.Light : statusBarStyleForColor(ColorPallet.brand.primary)}
      />
      <ScrollView style={styles.container}>
        <View style={{ alignItems: 'center' }}>
          <Biometrics style={[styles.image]} />
        </View>
        {biometryAvailable ? (
          <View>
            <Text style={[TextTheme.normal]}>{t('Biometry.EnabledText1')}</Text>
            <Text></Text>
            <Text style={[TextTheme.normal]}>
              {t('Biometry.EnabledText2')}
              <Text style={[TextTheme.normal, { fontWeight: 'bold' }]}> {t('Biometry.Warning')}</Text>
            </Text>
          </View>
        ) : (
          <View>
            <Text style={[TextTheme.normal]}>{t('Biometry.NotEnabledText1')}</Text>
            <Text></Text>
            <Text style={[TextTheme.normal]}>{t('Biometry.NotEnabledText2')}</Text>
          </View>
        )}
        <View
          style={{
            flexDirection: 'row',
            marginVertical: 20,
          }}
        >
          <View style={{ flexShrink: 1, marginRight: 10, justifyContent: 'center' }}>
            <Text style={[TextTheme.normal, { fontWeight: 'bold' }]}>{t('Biometry.UseToUnlock')}</Text>
          </View>
          <View style={{ justifyContent: 'center' }}>
            <Switch
              accessibilityLabel={t('Biometry.Toggle')}
              testID={testIdWithKey('ToggleBiometrics')}
              trackColor={{ false: ColorPallet.grayscale.lightGrey, true: ColorPallet.brand.primaryDisabled }}
              thumbColor={biometryEnabled ? ColorPallet.brand.primary : ColorPallet.grayscale.mediumGrey}
              ios_backgroundColor={ColorPallet.grayscale.lightGrey}
              onValueChange={toggleSwitch}
              value={biometryEnabled}
              disabled={!biometryAvailable}
            />
          </View>
        </View>
      </ScrollView>
      <View style={{ marginTop: 'auto', margin: 20 }}>
        {store.onboarding.didConsiderBiometry || (
          <Button
            title={'Continue'}
            accessibilityLabel={'Continue'}
            testID={testIdWithKey('Continue')}
            onPress={continueTouched}
            buttonType={ButtonType.Primary}
            disabled={!continueEnabled}
          />
        )}
      </View>
      <CheckPin
        visible={canSeeCheckPin}
        action={store.preferences.useBiometry ? Action.Enable : Action.Disable}
        onAuthenticationComplete={blarb}
      />
    </SafeAreaView>
  )
}

export default UseBiometry
