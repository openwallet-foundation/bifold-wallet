import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import * as RNLocalize from 'react-native-localize'

import { defaultLanguage } from '../constants'

import en from './en'

export type Translation = typeof en

const resources = {
  en: {
    translation: en,
  },
}
const availableLanguages = Object.keys(resources)
const bestLanguageMatch = RNLocalize.findBestAvailableLanguage(availableLanguages)
let translationToUse = defaultLanguage

if (bestLanguageMatch && availableLanguages.includes(bestLanguageMatch.languageTag)) {
  translationToUse = bestLanguageMatch.languageTag
}

i18n.use(initReactI18next).init({
  debug: true,
  lng: translationToUse,
  fallbackLng: defaultLanguage,
  resources,
})

export default i18n
