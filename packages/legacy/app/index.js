/* eslint-disable import/no-extraneous-dependencies */
/**
 * @format
 */
import 'react-native-gesture-handler'
// remove these when updated to react-native 0.65.0
import '@formatjs/intl-getcanonicallocales/polyfill'
import '@formatjs/intl-locale/polyfill'
import '@formatjs/intl-pluralrules/polyfill'
import '@formatjs/intl-pluralrules/locale-data/en' // locale-data for en
import '@formatjs/intl-displaynames/polyfill'
import '@formatjs/intl-displaynames/locale-data/en' // locale-data for en
import '@formatjs/intl-listformat/polyfill'
import '@formatjs/intl-listformat/locale-data/en' // locale-data for en
import '@formatjs/intl-numberformat/polyfill'
import '@formatjs/intl-numberformat/locale-data/en' // locale-data for en
import '@formatjs/intl-relativetimeformat/polyfill'
import '@formatjs/intl-relativetimeformat/locale-data/en' // locale-data for en
import '@formatjs/intl-datetimeformat/polyfill'
import '@formatjs/intl-datetimeformat/locale-data/en' // locale-data for en
import '@formatjs/intl-datetimeformat/add-all-tz' // Add ALL tz data

import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native'
import { NavigationTheme } from 'aries-bifold'
import * as React from 'react'
import { AppRegistry, LogBox } from 'react-native'

import App from './App'
import { name as appName } from './app.json'

const navigationTheme = {
  ...NavigationTheme,
}

LogBox.ignoreAllLogs()

const Base = () => {
  const navigationRef = useNavigationContainerRef()

  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme}>
      <App />
    </NavigationContainer>
  )
}

AppRegistry.registerComponent(appName, () => Base)
