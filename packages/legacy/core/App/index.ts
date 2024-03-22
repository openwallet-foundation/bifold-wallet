/* eslint-disable import/no-cycle */

import { Agent } from '@credo-ts/core'
import AgentProvider from '@credo-ts/react-hooks'

import App from './App'
import * as components from './components'
import { ButtonImpl as Button, ButtonType, Button as IButton } from './components/buttons/Button'
import HeaderButton, { ButtonLocation } from './components/buttons/HeaderButton'
import CheckBoxRow from './components/inputs/CheckBoxRow'
import ContentGradient from './components/misc/ContentGradient'
import CredentialCard from './components/misc/CredentialCard'
import InfoBox, { InfoBoxType } from './components/misc/InfoBox'
import ErrorModal from './components/modals/ErrorModal'
import NetInfo from './components/network/NetInfo'
import Record from './components/record/Record'
import InfoTextBox from './components/texts/InfoTextBox'
import Link from './components/texts/Link'
import Text from './components/texts/Text'
import { ToastType } from './components/toast/BaseToast'
import { AttachTourStep } from './components/tour/AttachTourStep'
import { credentialOfferTourSteps } from './components/tour/CredentialOfferTourSteps'
import { credentialsTourSteps } from './components/tour/CredentialsTourSteps'
import { homeTourSteps } from './components/tour/HomeTourSteps'
import { proofRequestTourSteps } from './components/tour/ProofRequestTourSteps'
import { TourBox } from './components/tour/TourBox'
import HomeFooterView from './components/views/HomeFooterView'
import indyLedgers from './configs/ledgers/indy'
import * as contexts from './contexts'
import { CommonUtilProvider } from './contexts/commons'
import { NetworkProvider } from './contexts/network'
import { TourProvider } from './contexts/tour/tour-provider'
import RootStack from './navigators/RootStack'
import Developer from './screens/Developer'
import OnboardingPages from './screens/OnboardingPages'
import Preface from './screens/Preface'
import Splash from './screens/Splash'
import Terms from './screens/Terms'
import UseBiometry from './screens/UseBiometry'
import { loadLoginAttempt } from './services/keychain'

export { animatedComponents } from './animated-components'
export { EventTypes, LocalStorageKeys } from './constants'
export { AnimatedComponentsProvider, useAnimatedComponents } from './contexts/animated-components'
export { useAuth } from './contexts/auth'
export { ConfigurationProvider, useConfiguration } from './contexts/configuration'
export { DispatchAction, default as Store, reducer } from './contexts/reducers/store'
export { StoreContext, StoreProvider, defaultState, mergeReducers, useStore } from './contexts/store'
export { ThemeProvider, useTheme } from './contexts/theme'
export { Locales, initLanguages, initStoredLanguage, translationResources } from './localization'
export { createStyles } from './screens/OnboardingPages'
export { ColorPallet, Assets as ImageAssets, NavigationTheme, theme } from './theme'
export { BifoldError } from './types/error'
export { Screens, Stacks, TabStacks } from './types/navigators'
export { createLinkSecretIfRequired, getAgentModules } from './utils/agent'
export { removeExistingInvitationIfRequired } from './utils/helpers'
export { StatusBarStyles, statusBarStyleForColor } from './utils/luminance'
export { didMigrateToAskar, migrateToAskar } from './utils/migration'
export { testIdForAccessabilityLabel, testIdWithKey } from './utils/testable'

export type { AnimatedComponents } from './animated-components'
export * from './container-api'
export { MainContainer } from './container-impl'
export type { ConfigurationContext } from './contexts/configuration'
export type { ReducerAction } from './contexts/reducers/store'
export type { TourStep } from './contexts/tour/tour-context'
export type {
  IAssets,
  IBrandColors,
  IColorPallet,
  IFontAttributes,
  IGrayscaleColors,
  IInputAttributes,
  IInputs,
  INotificationColors,
  ISVGAssets,
  ISemanticColors,
  ITextTheme,
  ITheme,
} from './theme'
export type { GenericFn } from './types/fn'
export type { AuthenticateStackParams, OnboardingStackParams } from './types/navigators'
export type { WalletSecret } from './types/security'
export type {
  LoginAttempt as LoginAttemptState,
  Migration as MigrationState,
  Onboarding as OnboardingState,
  Preferences as PreferencesState,
  State,
  Tours as ToursState,
} from './types/state'

export {
  Agent,
  AgentProvider,
  App,
  AttachTourStep,
  Button,
  ButtonLocation,
  ButtonType,
  CheckBoxRow,
  CommonUtilProvider,
  ContentGradient,
  CredentialCard,
  Developer,
  ErrorModal,
  HeaderButton,
  HomeFooterView as HomeContentView,
  InfoBox,
  InfoBoxType,
  InfoTextBox,
  Link,
  NetInfo,
  NetworkProvider,
  OnboardingPages,
  Preface,
  Record,
  RootStack,
  Splash,
  Terms,
  Text,
  ToastType,
  TourBox,
  TourProvider,
  UseBiometry,
  components,
  contexts,
  credentialOfferTourSteps,
  credentialsTourSteps,
  homeTourSteps,
  indyLedgers,
  loadLoginAttempt,
  proofRequestTourSteps,
}
export type { IButton }
