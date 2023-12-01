import { DefaultOCABundleResolver } from '@hyperledger/aries-oca/build/legacy'

import { ConfigurationContext } from '../../App'
import Record from '../../App/components/record/Record'
import { useNotifications } from '../../App/hooks/notifications'
import { useProofRequestTemplates } from '../../verifier/request-templates'
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
  OCABundleResolver: new DefaultOCABundleResolver(require('../../App/assets/oca-bundles.json')),
  useBiometry: () => null,
  record: Record,
  settings: [],
  developer: () => null,
  scan: () => null,
  indyLedgers: [],
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
  customNotification: {
    component: () => null,
    onCloseAction: () => null,
    title: '',
    description: '',
    buttonTitle: '',
    pageTitle: '',
  },
  useCustomNotifications: useNotifications,
  proofRequestTemplates: useProofRequestTemplates,
  supportedLanguages: [Locales.en, Locales.fr, Locales.ptBr],
  whereToUseWalletUrl: 'https://example.com',
}

export default configurationContext
