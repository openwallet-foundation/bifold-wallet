import 'react-i18next'
import { Translation } from '../i18n'

declare module 'react-i18next' {
  interface CustomTypeOptions {
    resources: {
      translation: Translation
    }
  }
}
