import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { useTheme } from '../../contexts/theme'
import { useDefaultStackOptions } from '../../navigators/defaultStackOptions'
import { SendVideoStackParams, Screens } from './types/navigators'
// import { testIdWithKey } from '../../utils/testable'
import SubmitVideo from './SubmitVideo'
import VerifyVideo from './VerifyVideo'
import VideoInstructions from './VideoInstructions'

const SendVideoStack: React.FC = () => {
  const Stack = createStackNavigator<SendVideoStackParams>()
  const theme = useTheme()
  const { t } = useTranslation()
  const defaultStackOptions = useDefaultStackOptions(theme)

  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions }}>
      <Stack.Screen
        name={Screens.VideoInstructions}
        component={VideoInstructions}
        options={() => ({
          title: t('SendVideo.Screens.VideoInstructions'),
          headerRight: () => null,
          headerLeft: () => null,
        })}
      />
      <Stack.Screen
        name={Screens.VerifyVideo}
        component={VerifyVideo}
        options={() => ({
          title: t('SendVideo.Screens.VerifyVideo'),
          headerRight: () => null,
          headerLeft: () => null,
          header: () => null,
        })}
      />

      <Stack.Screen
        name={Screens.SubmitVideo}
        component={SubmitVideo}
        options={() => ({
          title: t('SendVideo.Screens.VerifyVideo'),
          headerRight: () => null,
          headerLeft: () => null,
          header: () => null,
        })}
      />
    </Stack.Navigator>
  )
}

export default SendVideoStack
