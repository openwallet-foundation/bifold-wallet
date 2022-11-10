import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { useConfiguration } from '../contexts/configuration'
import { useTheme } from '../contexts/theme'
import Developer from '../screens/Developer'
import Language from '../screens/Language'
import Onboarding from '../screens/Onboarding'
import { createCarouselStyle } from '../screens/OnboardingPages'
import PinCreate from '../screens/PinCreate'
import PinRecreate from '../screens/PinRecreate'
import Settings from '../screens/Settings'
import UseBiometry from '../screens/UseBiometry'
import { Screens, SettingStackParams } from '../types/navigators'

import { createDefaultStackOptions } from './defaultStackOptions'

const SettingStack: React.FC = () => {
  const Stack = createStackNavigator<SettingStackParams>()
  const theme = useTheme()
  const { t } = useTranslation()
  const { pages, terms } = useConfiguration()
  const defaultStackOptions = createDefaultStackOptions(theme)
  const OnboardingTheme = theme.OnboardingTheme
  const carousel = createCarouselStyle(OnboardingTheme)

  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions }}>
      <Stack.Screen name={Screens.Settings} component={Settings} options={{ title: t('Screens.Settings') }} />
      <Stack.Screen name={Screens.Language} component={Language} options={{ title: t('Screens.Language') }} />
      <Stack.Screen name={Screens.UseBiometry} component={UseBiometry} options={{ title: t('Screens.Biometry') }} />
      <Stack.Screen name={Screens.RecreatePin} component={PinRecreate} options={{ title: t('Screens.ChangePin') }} />
      <Stack.Screen name={Screens.CreatePin} component={PinCreate} options={{ title: t('Screens.ChangePin') }} />
      <Stack.Screen name={Screens.Terms} component={terms} options={{ title: t('Screens.Terms') }} />
      <Stack.Screen name={Screens.Developer} component={Developer} options={{ title: t('Screens.Developer') }} />
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
    </Stack.Navigator>
  )
}

export default SettingStack
