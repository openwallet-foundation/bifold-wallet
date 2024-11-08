/* eslint-disable import/no-cycle */
import type { OnboardingStyleSheet } from './screens/Onboarding'

import { Agent } from '@credo-ts/core'
import AgentProvider from '@credo-ts/react-hooks'

import App from './App'
import * as components from './components'
import { Button as IButton, ButtonImpl as Button, ButtonType } from './components/buttons/Button'
import IconButton, { ButtonLocation } from './components/buttons/IconButton'
import BulletPoint from './components/inputs/BulletPoint'
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
import toastConfig from './components/toast/ToastConfig'
import { AttachTourStep } from './components/tour/AttachTourStep'
import { credentialOfferTourSteps } from './components/tour/CredentialOfferTourSteps'
import { credentialsTourSteps } from './components/tour/CredentialsTourSteps'
import { homeTourSteps } from './components/tour/HomeTourSteps'
import { proofRequestTourSteps } from './components/tour/ProofRequestTourSteps'
import { TourBox } from './components/tour/TourBox'
import LimitedTextInput from './components/inputs/LimitedTextInput'
import HomeFooterView from './components/views/HomeFooterView'
import KeyboardView from './components/views/KeyboardView'
import NotificationListItem from './components/listItems/NotificationListItem'
import * as contexts from './contexts'
import { AuthProvider } from './contexts/auth'
import { NetworkProvider } from './contexts/network'
import { useTour } from './contexts/tour/tour-context'
import { TourProvider } from './contexts/tour/tour-provider'
import AttemptLockout from './screens/AttemptLockout'
import Developer from './screens/Developer'
import OnboardingPages from './screens/OnboardingPages'
import Preface from './screens/Preface'
import Splash from './screens/Splash'
import Terms from './screens/Terms'
import UseBiometry from './screens/UseBiometry'
import { loadLoginAttempt } from './services/keychain'
import * as types from './types'
import Scan from './screens/Scan'
import Onboarding from './screens/Onboarding'
import { useDefaultStackOptions } from './navigators/defaultStackOptions'
import { PINRules, walletTimeout } from './constants'
import { CredentialListFooterProps } from './types/credential-list-footer'
import InactivityWrapper, { AutoLockTime } from './components/misc/InactivityWrapper'
import { OpenIDCredentialRecordProvider } from './modules/openid/context/OpenIDCredentialRecordProvider'
import { defaultConfig } from './container-impl'
import useInitializeAgent from './hooks/initialize-agent'

export * from './navigators'
export * from './services/storage'
export * from './types/attestation'
export { LocalStorageKeys } from './constants'
export * from './services/storage'
export { initLanguages, initStoredLanguage, translationResources, Locales } from './localization'
export { defaultState, mergeReducers, StoreProvider, StoreContext, useStore } from './contexts/store'
export { default as Store, DispatchAction, reducer } from './contexts/reducers/store'
export { useDeepLinks } from './hooks/deep-links'
export { Assets as ImageAssets } from './theme'
export { ThemeProvider, useTheme } from './contexts/theme'
export { AnimatedComponentsProvider, useAnimatedComponents } from './contexts/animated-components'
export { ColorPallet } from './theme'
export { animatedComponents } from './animated-components'
export { theme } from './theme'
export { useAuth } from './contexts/auth'
export { NavigationTheme } from './theme'
export { testIdWithKey, testIdForAccessabilityLabel } from './utils/testable'
export { Screens, Stacks, TabStacks } from './types/navigators'
export { createStyles } from './screens/OnboardingPages'
export { statusBarStyleForColor, StatusBarStyles } from './utils/luminance'
export { BifoldError } from './types/error'
export { EventTypes } from './constants'
export { migrateToAskar } from './utils/migration'
export { createLinkSecretIfRequired, getAgentModules } from './utils/agent'
export { removeExistingInvitationIfRequired, connectFromScanOrDeepLink } from './utils/helpers'

export type { AnimatedComponents } from './animated-components'
export type {
  ISVGAssets,
  IFontAttributes,
  IInputAttributes,
  IInputs,
  ITextTheme,
  IBrandColors,
  ISemanticColors,
  INotificationColors,
  IGrayscaleColors,
  IColorPallet,
  IAssets,
  ITheme,
} from './theme'
export type { PersistentState } from './types/state'
export type { BifoldAgent } from './utils/agent'
export type { TourStep, RenderProps } from './contexts/tour/tour-context'
export type { GenericFn } from './types/fn'
export type {
  AuthenticateStackParams,
  OnboardingStackParams,
  NotificationStackParams,
  ContactStackParams,
} from './types/navigators'
export type { OnboardingStyleSheet }
export type { WalletSecret } from './types/security'
export type { ReducerAction } from './contexts/reducers/store'
export type {
  State,
  Onboarding as OnboardingState,
  LoginAttempt as LoginAttemptState,
  Preferences as PreferencesState,
  Migration as MigrationState,
  Tours as ToursState,
} from './types/state'

export type { InlineMessageProps } from './components/inputs/InlineErrorText'

export type { InlineErrorPosition } from './types/error'

export type { CredentialListFooterProps }
export * from './container-api'
export { MainContainer } from './container-impl'

export {
  App,
  Agent,
  AgentProvider,
  AuthProvider,
  NetworkProvider,
  TourProvider,
  useTour,
  AttachTourStep,
  TourBox,
  defaultConfig,
  homeTourSteps,
  credentialsTourSteps,
  credentialOfferTourSteps,
  proofRequestTourSteps,
  ButtonType,
  ButtonLocation,
  CheckBoxRow,
  CredentialCard,
  ContentGradient,
  ErrorModal,
  IconButton,
  InactivityWrapper,
  InfoTextBox,
  InfoBox,
  InfoBoxType,
  Link,
  AutoLockTime,
  ToastType,
  toastConfig,
  NetInfo,
  OnboardingPages,
  OpenIDCredentialRecordProvider,
  NotificationListItem,
  useDefaultStackOptions,
  useInitializeAgent,
  Splash,
  Developer,
  Terms,
  Preface,
  HomeFooterView as HomeContentView,
  UseBiometry,
  AttemptLockout,
  Record,
  Scan,
  Onboarding,
  types,
  components,
  contexts,
  Text,
  loadLoginAttempt,
  Button,
  LimitedTextInput,
  KeyboardView,
  BulletPoint,
  PINRules,
  walletTimeout,
}
export type { IButton }
