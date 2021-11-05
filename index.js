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

import { NavigationContainer, Theme as NavigationTheme } from '@react-navigation/native'
import React, { useEffect } from 'react'
import { AppRegistry, LogBox } from 'react-native'

import App from './App'
import myTheme from './App/theme'
import { name as appName } from './app.json'

const navigationTheme = {
  dark: false,
  colors: {
    primary: myTheme.colors.mainColor,
    background: myTheme.colors.backgroundColor,
    card: myTheme.colors.mainColor,
    text: myTheme.colors.white,
    border: myTheme.colors.white,
    notification: myTheme.colors.white,
  },
}

const Base = () => {
  useEffect(() => {
    LogBox.ignoreLogs(['VirtualizedLists', 'Mediator Invitation', 'Non-serializable values'])
  }, [])

  return (
    <NavigationContainer theme={navigationTheme}>
      <App />
    </NavigationContainer>
  )
}

AppRegistry.registerComponent(appName, () => Base)
