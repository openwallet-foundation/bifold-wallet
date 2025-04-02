import 'react-i18next'
import { Translation } from '../localization'

declare module 'react-i18next' {
  interface CustomTypeOptions {
    resources: {
      translation: Translation
    }
  }
}
