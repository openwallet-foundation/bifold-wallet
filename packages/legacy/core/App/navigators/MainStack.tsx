import { CardStyleInterpolators, StackCardStyleInterpolator, createStackNavigator } from '@react-navigation/stack'
import React, { useMemo } from 'react'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'

import IconButton, { ButtonLocation } from '../components/buttons/IconButton'
import { TOKENS, useServices } from '../container-api'
import { useTheme } from '../contexts/theme'
import HistoryStack from '../modules/history/navigation/HistoryStack'
import Chat from '../screens/Chat'
import { Screens, Stacks, TabStacks } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

import ConnectStack from './ConnectStack'
import ContactStack from './ContactStack'
import { useTour } from '../contexts/tour/tour-context'
import DeliveryStack from './DeliveryStack'
import NotificationStack from './NotificationStack'
import ProofRequestStack from './ProofRequestStack'
import SettingStack from './SettingStack'
import TabStack from './TabStack'
import { useDefaultStackOptions } from './defaultStackOptions'
import CredentialDetails from '../screens/CredentialDetails'
import OpenIDCredentialDetails from '../modules/openid/screens/OpenIDCredentialDetails'

const MainStack: React.FC = () => {
  const { t } = useTranslation()
  const theme = useTheme()
  const { currentStep } = useTour()
  const defaultStackOptions = useDefaultStackOptions(theme)
  const [splash, CustomNavStack1, ScreenOptionsDictionary] = useServices([
    TOKENS.SCREEN_SPLASH,
    TOKENS.CUSTOM_NAV_STACK_1,
    TOKENS.OBJECT_SCREEN_CONFIG,
  ])

  const Stack = createStackNavigator()

  // This function is to make the fade in behavior of both iOS and
  // Android consistent for the settings menu
  const forFade: StackCardStyleInterpolator = ({ current }) => ({
    cardStyle: {
      opacity: current.progress,
    },
  })
  const hideElements = useMemo(() => (currentStep === undefined ? 'auto' : 'no-hide-descendants'), [currentStep])

  return (
    <View style={{ flex: 1 }} importantForAccessibility={hideElements}>
      <Stack.Navigator initialRouteName={Screens.Splash} screenOptions={{ ...defaultStackOptions, headerShown: false }}>
        <Stack.Screen name={Screens.Splash} component={splash} />
        <Stack.Screen name={Stacks.TabStack} component={TabStack} />
        <Stack.Screen
          name={Screens.CredentialDetails}
          component={CredentialDetails}
          options={{
            title: t('Screens.CredentialDetails'),
            headerShown: true,
            ...ScreenOptionsDictionary[Screens.CredentialDetails],
          }}
        />
        <Stack.Screen
          name={Screens.OpenIDCredentialDetails}
          component={OpenIDCredentialDetails}
          options={{
            title: t('Screens.CredentialDetails'),
            ...ScreenOptionsDictionary[Screens.OpenIDCredentialDetails],
          }}
        />
        <Stack.Screen
          name={Screens.Chat}
          component={Chat}
          options={({ navigation }) => ({
            headerShown: true,
            title: t('Screens.CredentialOffer'),
            headerLeft: () => (
              <IconButton
                buttonLocation={ButtonLocation.Left}
                accessibilityLabel={t('Global.Back')}
                testID={testIdWithKey('BackButton')}
                onPress={() => {
                  navigation.navigate(TabStacks.HomeStack, { screen: Screens.Home })
                }}
                icon="arrow-left"
              />
            ),
          })}
        />
        <Stack.Screen name={Stacks.ConnectStack} component={ConnectStack} />
        <Stack.Screen
          name={Stacks.SettingStack}
          component={SettingStack}
          options={{
            cardStyleInterpolator: forFade,
          }}
        />
        <Stack.Screen name={Stacks.ContactStack} component={ContactStack} />
        <Stack.Screen name={Stacks.NotificationStack} component={NotificationStack} />
        <Stack.Screen
          name={Stacks.ConnectionStack}
          component={DeliveryStack}
          options={{
            gestureEnabled: false,
            cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
            presentation: 'modal',
          }}
        />
        <Stack.Screen name={Stacks.ProofRequestsStack} component={ProofRequestStack} />
        <Stack.Screen
          name={Stacks.HistoryStack}
          component={HistoryStack}
          options={{
            cardStyleInterpolator: forFade,
          }}
        />
        {CustomNavStack1 ? <Stack.Screen name={Stacks.CustomNavStack1} component={CustomNavStack1} /> : null}
      </Stack.Navigator>
    </View>
  )
}

export default MainStack
