/**
 * @format
 */
import 'react-native-gesture-handler'
import { AppRegistry, LogBox } from 'react-native'
import React, { useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import App from './App'
import { name as appName } from './app.json'

const Base = () => {
  useEffect(() => {
    LogBox.ignoreLogs([
      'VirtualizedLists',
      'No command found with name',
      'Non-serializable values were found',
      'Mediator Invitation in',
      'new NativeEventEmitter',
    ])
  }, [])

  return (
    <NavigationContainer>
      <App />
    </NavigationContainer>
  )
}

AppRegistry.registerComponent(appName, () => Base)
