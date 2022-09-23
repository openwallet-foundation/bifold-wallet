/**
 * @format
 */
import 'react-native-reanimated'
import 'react-native-gesture-handler'
import '@formatjs/intl-pluralrules/polyfill'

import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native'
import { NavigationTheme } from 'aries-bifold'
import React from 'react'
import { AppRegistry } from 'react-native'

import App from './App'
import { name as appName } from './app.json'

const navigationTheme = {
	...NavigationTheme,
}

const Base = () => {
  const navigationRef = useNavigationContainerRef()
  return (
    <NavigationContainer theme={navigationTheme}>
      <App />
    </NavigationContainer>
  )
}

AppRegistry.registerComponent(appName, () => Base)
