import Record from './components/record/Record'
import HomeContentView from './components/views/HomeContentView'
import { ConfigurationContext } from './contexts/configuration'
import OnboardingPages from './screens/OnboardingPages'
import Splash from './screens/Splash'
import Terms from './screens/Terms'
import UseBiometry from './screens/UseBiometry'
import * as oca from './types/oca'

export const defaultConfiguration: ConfigurationContext = {
  pages: OnboardingPages,
  splash: Splash,
  terms: Terms,
  homeContentView: HomeContentView,
  OCABundle: new oca.DefaultOCABundleResolver().loadDefaultBundles(),
  useBiometry: UseBiometry,
  record: Record,
}
