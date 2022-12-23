import { ConfigurationContext } from '../../App'
import Record from '../../App/components/record/Record'
import { DefaultOCABundleResolver } from '../../App/types/oca'

const configurationContext: ConfigurationContext = {
  pages: () => [],
  terms: () => null,
  splash: () => null,
  homeContentView: () => null,
  credentialListHeaderRight: () => null,
  credentialListOptions: () => null,
  credentialEmptyList: () => null,
  OCABundle: new DefaultOCABundleResolver(),
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
}

export default configurationContext
