import { ProofCustomMetadata, ProofMetadata } from '@bifold/verifier'
import { useAgent, useProofByState } from '@credo-ts/react-hooks'
import { ProofState } from '@credo-ts/core'
import { CardStyleInterpolators, StackCardStyleInterpolator, createStackNavigator } from '@react-navigation/stack'
import React, { useEffect, useMemo } from 'react'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'

import IconButton, { ButtonLocation } from '../components/buttons/IconButton'
import { TOKENS, useServices } from '../container-api'
import { useTheme } from '../contexts/theme'
import HistoryStack from '../modules/history/navigation/HistoryStack'
import Chat from '../screens/Chat'
import { RootStackParams, Screens, Stacks, TabStacks } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'
import { useStore } from '../contexts/store'
import { useTour } from '../contexts/tour/tour-context'
import { useDeepLinks } from '../hooks/deep-links'
import CredentialDetails from '../screens/CredentialDetails'
import OpenIDCredentialDetails from '../modules/openid/screens/OpenIDCredentialDetails'

import ConnectStack from './ConnectStack'
import ContactStack from './ContactStack'
import DeliveryStack from './DeliveryStack'
import NotificationStack from './NotificationStack'
import ProofRequestStack from './ProofRequestStack'
import SettingStack from './SettingStack'
import TabStack from './TabStack'
import { useDefaultStackOptions } from './defaultStackOptions'

const MainStack: React.FC = () => {
  const { t } = useTranslation()
  const theme = useTheme()
  const { currentStep } = useTour()
  const [store] = useStore()
  const { agent } = useAgent()
  const defaultStackOptions = useDefaultStackOptions(theme)
  const [CustomNavStack1, ScreenOptionsDictionary] = useServices([
    TOKENS.CUSTOM_NAV_STACK_1,
    TOKENS.OBJECT_SCREEN_CONFIG,
  ])
  const declinedProofs = useProofByState([ProofState.Declined, ProofState.Abandoned])
  useDeepLinks()

  // remove connection on mobile verifier proofs if proof is rejected
  useEffect(() => {
    declinedProofs.forEach((proof) => {
      const meta = proof?.metadata?.get(ProofMetadata.customMetadata) as ProofCustomMetadata
      if (meta?.delete_conn_after_seen) {
        agent?.connections.deleteById(proof?.connectionId ?? '').catch(() => null)
        proof?.metadata.set(ProofMetadata.customMetadata, { ...meta, delete_conn_after_seen: false })
      }
    })
  }, [declinedProofs, agent, store.preferences.useDataRetention])

  const Stack = createStackNavigator<RootStackParams>()

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
      <Stack.Navigator
        initialRouteName={Stacks.TabStack}
        screenOptions={{
          ...defaultStackOptions,
          headerShown: false,
        }}
      >
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
