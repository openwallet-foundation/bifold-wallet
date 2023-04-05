import defaultIndyLedgers from '../configs/ledgers/indy'
import { defaultProofRequestTemplates } from '../verifier'

import * as bundle from './assets/oca-bundles.json'
import EmptyList from './components/misc/EmptyList'
import Record from './components/record/Record'
import HomeContentView from './components/views/HomeContentView'
import { PINRules } from './constants'
import { ConfigurationContext } from './contexts/configuration'
import { useNotifications } from './hooks/notifications'
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
  credentialListHeaderRight: () => null,
  credentialListOptions: () => null,
  credentialEmptyList: EmptyList,
  OCABundleResolver: new oca.OCABundleResolver(bundle as unknown as Record<string, oca.Bundle>, {
    cardOverlayType: oca.CardOverlayType.CardLayout11,
  }),
  scan: Scan,
  useBiometry: UseBiometry,
  record: Record,
  PINSecurity: { rules: PINRules, displayHelper: false },
  indyLedgers: defaultIndyLedgers,
  settings: [],
  customNotification: {
    component: () => null,
    onCloseAction: () => null,
    title: '',
    description: '',
    buttonTitle: '',
    pageTitle: '',
  },
  useCustomNotifications: useNotifications,
  proofRequestTemplates: defaultProofRequestTemplates,
}
