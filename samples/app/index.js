// Polyfill TextEncoder for bip39
if (typeof global.TextEncoder === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  global.TextEncoder = require('text-encoding').TextEncoder
}
import { Buffer } from '@craftzdog/react-native-buffer'
global.Buffer = Buffer
import 'react-native-get-random-values' // polyfill for @credo-ts framework
import 'react-native-gesture-handler'
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
import 'reflect-metadata'

// Polyfills for hmd2v-xhd-wallet-api
import 'react-native-get-random-values'
// import 'hmd2v-xhd-wallet-api/polyfills'

// Import new wallet API
import 'hmd2v-xhd-wallet-api'

//Used to decode base64 in sub-modules like openID4Vp, or any other decoder
import { decode, encode } from 'base-64'

if (!global.btoa) {
  global.btoa = encode
}

if (!global.atob) {
  global.atob = decode
}

import { initLanguages, translationResources, createApp, MainContainer } from '@bifold/core'
import { AppRegistry, LogBox } from 'react-native'
import { container } from 'tsyringe'

import { name as appName } from './app.json'
import { AppContainer } from './container-imp'

LogBox.ignoreAllLogs()

initLanguages(translationResources)
const bifoldContainer = new MainContainer(container.createChildContainer()).init()
const appContainer = new AppContainer(bifoldContainer).init()
const App = createApp(appContainer)
AppRegistry.registerComponent(appName, () => App)
