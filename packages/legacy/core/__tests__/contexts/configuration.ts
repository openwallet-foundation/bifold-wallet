import { ConfigurationContext } from '../../App'
import Record from '../../App/components/record/Record'
import { Locales } from '../../App/localization'

const configurationContext: ConfigurationContext = {
  pages: () => [],
  terms: () => null,
  splash: () => null,
  preface: () => null,
  homeHeaderView: () => null,
  homeFooterView: () => null,
  credentialListHeaderRight: () => null,
  credentialListOptions: () => null,
  credentialEmptyList: () => null,
  useBiometry: () => null,
  record: Record,
  settings: [],
  developer: () => null,
  scan: () => null,
  PINSecurity: {
    rules: {
      only_numbers: true,
      min_length: 6,
      max_length: 6,
      no_repeated_numbers: false,
      no_repetition_of_the_two_same_numbers: false,
      no_series_of_numbers: false,
      no_even_or_odd_series_of_numbers: false,
      no_cross_pattern: false,
    },
    displayHelper: false,
  },
  supportedLanguages: [Locales.en, Locales.fr, Locales.ptBr],
  whereToUseWalletUrl: 'https://example.com',
}

export default configurationContext
