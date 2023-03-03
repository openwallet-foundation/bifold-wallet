import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { useTheme } from '../contexts/theme'
import ListProofRequests from '../screens/ListProofRequests'
import { ProofRequestsStackParams, Screens } from '../types/navigators'

import { createDefaultStackOptions } from './defaultStackOptions'

const ProofRequestStack: React.FC = () => {
  const Stack = createStackNavigator<ProofRequestsStackParams>()
  const theme = useTheme()
  const { t } = useTranslation()
  const defaultStackOptions = createDefaultStackOptions(theme)
  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions }}>
      <Stack.Screen
        name={Screens.ProofRequests}
        component={ListProofRequests}
        options={{ title: t('Screens.ChooseProofRequest') }}
      />
    </Stack.Navigator>
  )
}

export default ProofRequestStack
