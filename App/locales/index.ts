import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import * as RNLocalize from 'react-native-localize'
import AsyncStorage from '@react-native-community/async-storage'

const translationGetters = {
  en: require('./en-US.json'), 
  fr: require('./fr-FR.json'), 
  hi: require('./hi-HI.json'), 
}

const currentLanguage = i18n.language


export enum Locales {
  en = 'en',
  fr = 'fr',
  hi = 'hi'
}

export interface ISetI18nConfig {
  languageTag: string
  isRTL: boolean
}

//** Store language into the AsyncStorage  */
const storeLanguage = async (id: string) =>{
  await AsyncStorage.setItem('language', id)
}

//** Fetch user preference language from the AsyncStorage and set if require  */
const initStoredLanguage = async () => {
  const langId = await AsyncStorage.getItem('language')
  if(langId !== null){
    if (langId !== currentLanguage) {
      await i18n.changeLanguage(langId)
    }
  }
}

const fallback: ISetI18nConfig = { languageTag: Locales.en, isRTL: false }
const { languageTag } = RNLocalize.findBestAvailableLanguage(Object.keys(translationGetters)) || fallback

i18n.use(initReactI18next).init({
  resources: translationGetters,
  lng: languageTag,
  fallbackLng: Locales.en,
  debug: false,
  interpolation: {
    escapeValue: false,
  },
})


export { RNLocalize, i18n, storeLanguage, initStoredLanguage }
