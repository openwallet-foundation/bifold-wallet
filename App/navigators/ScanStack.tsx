import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'

import defaultStackOptions from './defaultStackOptions'
import Scan from '../screens/Scan'
import { useTranslation } from 'react-i18next'

const Stack = createStackNavigator()

function ScanStack() {
  const { t } = useTranslation()

  return (
    <Stack.Navigator screenOptions={defaultStackOptions}>
      <Stack.Screen options={{title: t('ScanStack.scan')}} name="Scan" component={Scan} />
    </Stack.Navigator>
  )
}

export default ScanStack
