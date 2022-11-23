import defaultIndyLedgers from '../configs/ledgers/indy'

import Record from './components/record/Record'
import HomeContentView from './components/views/HomeContentView'
import { ConfigurationContext } from './contexts/configuration'
import Developer from './screens/Developer'
import OnboardingPages from './screens/OnboardingPages'
import Scan from './screens/Scan'
import Splash from './screens/Splash'
import Terms from './screens/Terms'
import UseBiometry from './screens/UseBiometry'
import * as oca from './types/oca'
import { PINRules } from './types/security'

const pinRules: PINRules = {
  only_numbers: true,
  min_length: 6,
  max_length: 6,
  no_repeated_numbers: false,
  no_repetition_of_the_two_same_numbers: false,
  no_series_of_numbers: false,
  no_even_or_odd_series_of_numbers: false,
  no_cross_pattern: false,
}

export const defaultConfiguration: ConfigurationContext = {
  pages: OnboardingPages,
  splash: Splash,
  terms: Terms,
  developer: Developer,
  homeContentView: HomeContentView,
  OCABundle: new oca.DefaultOCABundleResolver().loadDefaultBundles(),
  scan: Scan,
  useBiometry: UseBiometry,
  record: Record,
  pinSecurity: { rules: pinRules, displayHelper: false },
  indyLedgers: defaultIndyLedgers,
  settings: [],
}
