import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View, Switch, StatusBar, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import Biometrics from '../assets/img/biometrics.svg'
import Button, { ButtonType } from '../components/buttons/Button'
import { useAuth } from '../contexts/auth'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { statusBarStyleForColor, StatusBarStyles } from '../utils/luminance'
import { testIdWithKey } from '../utils/testable'

const UseBiometry: React.FC = () => {
  const [, dispatch] = useStore()
  const { t } = useTranslation()
  const { convertToUseBiometrics } = useAuth()
  const [biometryEnabled, setBiometryEnabled] = useState(false)
  const [continueEnabled, setContinueEnabled] = useState(true)
  const { ColorPallet, TextTheme } = useTheme()
  const styles = StyleSheet.create({
    container: {
      flexGrow: 2,
      flexDirection: 'column',
      paddingHorizontal: 25,
      backgroundColor: ColorPallet.brand.primaryBackground,
    },
    image: {
      minWidth: 200,
      minHeight: 200,
      marginBottom: 66,
    },
  })

  const continueTouched = async () => {
    setContinueEnabled(false)

    if (biometryEnabled) {
      await convertToUseBiometrics()
    }

    dispatch({
      type: DispatchAction.USE_BIOMETRY,
      payload: [biometryEnabled],
    })
  }

  const toggleSwitch = () => setBiometryEnabled((previousState) => !previousState)

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={Platform.OS === 'android' ? StatusBarStyles.Light : statusBarStyleForColor(ColorPallet.brand.primary)}
      />
      <View style={{ flexGrow: 1 }}>
        <View style={{ alignItems: 'center' }}>
          <Biometrics style={[styles.image]} />
        </View>
        <Text style={[TextTheme.normal]}>{t('Biometry.Text1')}</Text>
        <Text></Text>
        <Text style={[TextTheme.normal]}>
          {t('Biometry.Text2')}
          <Text style={[TextTheme.normal, { fontWeight: 'bold' }]}> {t('Biometry.Warning')}</Text>
        </Text>
        <View
          style={{
            flexDirection: 'row',
            marginVertical: 30,
          }}
        >
          <View style={{ flexShrink: 1 }}>
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
            />
          </View>
        </View>
        <View style={{ flexGrow: 1, justifyContent: 'flex-end' }}>
          <Button
            title={'Continue'}
            accessibilityLabel={'Continue'}
            testID={testIdWithKey('Continue')}
            onPress={continueTouched}
            buttonType={ButtonType.Primary}
            disabled={!continueEnabled}
          />
        </View>
      </View>
    </SafeAreaView>
  )
}

export default UseBiometry
