import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { useTheme } from '../contexts/theme'
import ListProofRequests from '../screens/ListProofRequests'
import ProofDetails from '../screens/ProofDetails'
import ProofRequestFullName from '../screens/ProofRequestFullName'
import ProofRequesting from '../screens/ProofRequesting'
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
        name={Screens.ProofRequestFullName}
        component={ProofRequestFullName}
        options={() => ({
          title: t('Screens.ProofRequestFullName'),
        })}
      />
      <Stack.Screen
        name={Screens.ProofRequests}
        component={ListProofRequests}
        options={{ title: t('Screens.ChooseProofRequest') }}
      />
      <Stack.Screen name={Screens.ProofRequesting} component={ProofRequesting} />
      <Stack.Screen name={Screens.ProofDetails} component={ProofDetails} />
    </Stack.Navigator>
  )
}

export default ProofRequestStack
