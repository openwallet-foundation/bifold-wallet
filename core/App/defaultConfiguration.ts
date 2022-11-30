import defaultIndyLedgers from '../configs/ledgers/indy'

import Record from './components/record/Record'
import HomeContentView from './components/views/HomeContentView'
import { pinRules } from './constants'
import { ConfigurationContext } from './contexts/configuration'
import Developer from './screens/Developer'
import OnboardingPages from './screens/OnboardingPages'
import Scan from './screens/Scan'
import Splash from './screens/Splash'
import Terms from './screens/Terms'
import UseBiometry from './screens/UseBiometry'
import * as oca from './types/oca'

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
