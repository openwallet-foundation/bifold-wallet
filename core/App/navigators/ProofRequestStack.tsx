import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'

import HeaderRightHome from '../components/buttons/HeaderRightHome'
import { useTheme } from '../contexts/theme'
import ListProofRequests from '../screens/ListProofRequests'
import ProofDetails from '../screens/ProofDetails'
import ProofRequestDetails from '../screens/ProofRequestDetails'
import ProofRequestUsageHistory from '../screens/ProofRequestUsageHistory'
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
        name={Screens.ProofRequests}
        component={ListProofRequests}
        options={{ title: t('Screens.ChooseProofRequest') }}
      />
      <Stack.Screen
        name={Screens.ProofRequestDetails}
        component={ProofRequestDetails}
        options={() => ({
          title: '',
        })}
      />
      <Stack.Screen
        name={Screens.ProofRequesting}
        component={ProofRequesting}
        options={() => ({
          title: '',
        })}
      />
      <Stack.Screen
        name={Screens.ProofDetails}
        component={ProofDetails}
        options={() => ({
          title: '',
          headerRight: () => <HeaderRightHome />,
        })}
      />
      <Stack.Screen
        name={Screens.ProofRequestUsageHistory}
        component={ProofRequestUsageHistory}
        options={() => ({
          title: '',
          headerRight: () => <HeaderRightHome />,
        })}
      />
    </Stack.Navigator>
  )
}

export default ProofRequestStack
