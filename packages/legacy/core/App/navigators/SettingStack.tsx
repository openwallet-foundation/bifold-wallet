import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { CommonActions } from '@react-navigation/core'

import { useTheme } from '../contexts/theme'
import HistorySettings from '../modules/history/ui/HistorySettings'
import DataRetention from '../screens/DataRetention'
import Language from '../screens/Language'
import NameWallet from '../screens/NameWallet'
import Onboarding from '../screens/Onboarding'
import { createCarouselStyle } from '../screens/OnboardingPages'
import PINCreate from '../screens/PINCreate'
import PushNotification from '../screens/PushNotification'
import Settings from '../screens/Settings'
import Tours from '../screens/Tours'
import AutoLock from '../screens/AutoLock'
import PINEnter, { PINEntryUsage } from '../screens/PINEnter'
import { Screens, SettingStackParams } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'
import IconButton, { ButtonLocation } from '../components/buttons/IconButton'
import { useDefaultStackOptions } from './defaultStackOptions'
import { TOKENS, useServices } from '../container-api'
import PINChangeConfirmation from '../screens/PINChangeConfirmation'
import { useNavigation } from '@react-navigation/core'

const SettingStack: React.FC = () => {
  const Stack = createStackNavigator<SettingStackParams>()
  const theme = useTheme()
  const { t } = useTranslation()
  const [pages, { screen: terms }, UseBiometry, developer, ScreenOptionsDictionary] = useServices([
    TOKENS.SCREEN_ONBOARDING_PAGES,
    TOKENS.SCREEN_TERMS,
    TOKENS.SCREEN_USE_BIOMETRY,
    TOKENS.SCREEN_DEVELOPER,
    TOKENS.OBJECT_SCREEN_CONFIG,
  ])
  const defaultStackOptions = useDefaultStackOptions(theme)
  const OnboardingTheme = theme.OnboardingTheme
  const carousel = createCarouselStyle(OnboardingTheme)
  const navigation = useNavigation()

  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions }}>
      <Stack.Screen
        name={Screens.Settings}
        component={Settings}
        options={{
          title: t('Screens.Settings'),
          headerBackTestID: testIdWithKey('Back'),
          ...ScreenOptionsDictionary[Screens.Settings],
        }}
      />
      <Stack.Screen
        name={Screens.NameWallet}
        component={NameWallet}
        options={{
          title: t('Screens.NameWallet'),
          headerBackTestID: testIdWithKey('Back'),
          ...ScreenOptionsDictionary[Screens.NameWallet],
        }}
      />
      <Stack.Screen
        name={Screens.Language}
        component={Language}
        options={{
          title: t('Screens.Language'),
          headerBackTestID: testIdWithKey('Back'),
          ...ScreenOptionsDictionary[Screens.Language],
        }}
      />
      <Stack.Screen
        name={Screens.AutoLock}
        component={AutoLock}
        options={{
          title: 'Auto lock Options',
          headerBackTestID: testIdWithKey('Back'),
          ...ScreenOptionsDictionary[Screens.AutoLock],
        }}
      />
      <Stack.Screen
        name={Screens.DataRetention}
        component={DataRetention}
        options={{
          title: t('Screens.DataRetention'),
          headerBackTestID: testIdWithKey('Back'),
          ...ScreenOptionsDictionary[Screens.DataRetention],
        }}
      />
      <Stack.Screen
        name={Screens.Tours}
        component={Tours}
        options={{
          title: t('Screens.Tours'),
          headerBackTestID: testIdWithKey('Back'),
          ...ScreenOptionsDictionary[Screens.Tours],
        }}
      />
      <Stack.Screen
        name={Screens.UseBiometry}
        component={UseBiometry}
        options={{
          title: t('Screens.Biometry'),
          headerBackTestID: testIdWithKey('Back'),
          ...ScreenOptionsDictionary[Screens.UseBiometry],
        }}
      />
      <Stack.Screen
        name={Screens.CreatePIN}
        options={{
          title: t('Screens.ChangePIN'),
          headerBackTestID: testIdWithKey('Back'),
          headerLeft: () => (
            <IconButton
              buttonLocation={ButtonLocation.Left}
              accessibilityLabel={t('Global.Back')}
              testID={testIdWithKey('BackButton')}
              onPress={() => {
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: Screens.Settings }],
                  })
                )
              }}
              icon="arrow-left"
            />
          ),
          ...ScreenOptionsDictionary[Screens.CreatePIN],
        }}
      >
        {(props: any) => <PINCreate explainedStatus {...props} />}
      </Stack.Screen>
      <Stack.Screen
        name={Screens.EnterPIN}
        component={(props) => <PINEnter usage={PINEntryUsage.PINChange} {...props} />}
        options={{
          title: t('Screens.ChangePIN'),
          headerBackTestID: testIdWithKey('Back'),
          ...ScreenOptionsDictionary[Screens.EnterPIN],
        }}
      />
      <Stack.Screen
        name={Screens.PINChangeConfirmation}
        component={PINChangeConfirmation}
        options={{
          title: t('Screens.PINChangeConfirmation'),
          headerBackTestID: testIdWithKey('Back'),
          headerLeft: () => (
            <IconButton
              buttonLocation={ButtonLocation.Left}
              accessibilityLabel={t('Global.Back')}
              testID={testIdWithKey('BackButton')}
              onPress={() => {
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: Screens.Settings }],
                  })
                )
              }}
              icon="arrow-left"
            />
          ),
          ...ScreenOptionsDictionary[Screens.PINChangeConfirmation],
        }}
      />
      <Stack.Screen
        name={Screens.UsePushNotifications}
        component={PushNotification}
        options={{
          title: t('Screens.UsePushNotifications'),
          headerBackTestID: testIdWithKey('Back'),
          ...ScreenOptionsDictionary[Screens.UsePushNotifications],
        }}
      />
      <Stack.Screen
        name={Screens.Terms}
        component={terms}
        options={{
          title: t('Screens.Terms'),
          headerBackTestID: testIdWithKey('Back'),
          ...ScreenOptionsDictionary[Screens.Terms],
        }}
      />
      <Stack.Screen
        name={Screens.Developer}
        component={developer}
        options={{
          title: t('Screens.Developer'),
          headerBackTestID: testIdWithKey('Back'),
          ...ScreenOptionsDictionary[Screens.Developer],
        }}
      />
      <Stack.Screen name={Screens.Onboarding} options={{ title: t('Screens.Onboarding') }}>
        {(props) => (
          <Onboarding
            {...props}
            nextButtonText={t('Global.Next')}
            previousButtonText={t('Global.Back')}
            pages={pages(() => null, OnboardingTheme)}
            style={carousel}
            disableSkip={true}
          />
        )}
      </Stack.Screen>
      <Stack.Screen
        name={Screens.HistorySettings}
        component={HistorySettings}
        options={{
          title: t('Screens.HistorySettings'),
          headerBackTestID: testIdWithKey('Back'),
          ...ScreenOptionsDictionary[Screens.HistorySettings],
        }}
      />
    </Stack.Navigator>
  )
}

export default SettingStack
