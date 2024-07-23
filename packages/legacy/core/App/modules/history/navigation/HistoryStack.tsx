import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { useTheme } from '../../../contexts/theme'
import { createDefaultStackOptions } from '../../../navigators/defaultStackOptions'
import { HistoryStackParams, Screens } from '../../../types/navigators'
import { testIdWithKey } from '../../../utils/testable'
// import HistoryDetailsPage from '../ui/HistoryDetails'
import HistoryPage from '../ui/HistoryPage'

const HistoryStack: React.FC = () => {
  const Stack = createStackNavigator<HistoryStackParams>()
  const theme = useTheme()
  const { t } = useTranslation()
  const defaultStackOptions = createDefaultStackOptions(theme)

  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions }}>
      <Stack.Screen
        name={Screens.HistoryPage}
        component={HistoryPage}
        options={{ title: t('Screens.History'), headerBackTestID: testIdWithKey('Back') }}
      />
    </Stack.Navigator>
  )
}

export default HistoryStack
