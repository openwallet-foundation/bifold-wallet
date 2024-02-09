import { useProofRequestTemplates } from '@hyperledger/aries-bifold-verifier'
import { IOverlayBundleData } from '@hyperledger/aries-oca'
import { BrandingOverlayType, DefaultOCABundleResolver } from '@hyperledger/aries-oca/build/legacy'

import * as bundle from './assets/oca-bundles.json'
import EmptyList from './components/misc/EmptyList'
import Record from './components/record/Record'
import HomeFooterView from './components/views/HomeFooterView'
import HomeHeaderView from './components/views/HomeHeaderView'
import defaultIndyLedgers from './configs/ledgers/indy'
import { PINRules } from './constants'
import { ConfigurationContext } from './contexts/configuration'
import { useNotifications } from './hooks/notifications'
import { Locales, translationResources } from './localization'
import Developer from './screens/Developer'
import OnboardingPages from './screens/OnboardingPages'
import Preface from './screens/Preface'
import Scan from './screens/Scan'
import Splash from './screens/Splash'
import Terms from './screens/Terms'
import UseBiometry from './screens/UseBiometry'

export const defaultConfiguration: ConfigurationContext = {
  pages: OnboardingPages,
  splash: Splash,
  terms: Terms,
  preface: Preface,
  developer: Developer,
  homeHeaderView: HomeHeaderView,
  homeFooterView: HomeFooterView,
  credentialListHeaderRight: () => null,
  credentialListOptions: () => null,
  credentialEmptyList: EmptyList,
  OCABundleResolver: new DefaultOCABundleResolver(bundle as unknown as Record<string, IOverlayBundleData>, {
    brandingOverlayType: BrandingOverlayType.Branding10,
  }),
  scan: Scan,
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
  proofRequestTemplates: useProofRequestTemplates,
  enableTours: false,
  supportedLanguages: Object.keys(translationResources) as Locales[],
  showPreface: false,
  disableOnboardingSkip: false,
  useCustomNotifications: useNotifications,
  useBiometry: UseBiometry,
  whereToUseWalletUrl: 'https://example.com',
  showScanHelp: true,
  showScanButton: true,
  showDetailsInfo: true,
}
