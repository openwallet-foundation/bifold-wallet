/* eslint-disable import/no-cycle */
import type { OnboardingStyleSheet } from './screens/Onboarding'

import { Agent } from '@credo-ts/core'
import AgentProvider from '@credo-ts/react-hooks'

import createApp from './App'
import * as components from './components'
import { Button as IButton, ButtonImpl as Button, ButtonType } from './components/buttons/Button'
import IconButton, { ButtonLocation } from './components/buttons/IconButton'
import BulletPoint from './components/inputs/BulletPoint'
import CheckBoxRow from './components/inputs/CheckBoxRow'
import ContentGradient from './components/misc/ContentGradient'
import CredentialCard from './components/misc/CredentialCard'
import InfoBox, { InfoBoxType } from './components/misc/InfoBox'
import ErrorModal from './components/modals/ErrorModal'
import SafeAreaModal from './components/modals/SafeAreaModal'
import Record from './components/record/Record'
import InfoTextBox from './components/texts/InfoTextBox'
import Link from './components/texts/Link'
import Text from './components/texts/Text'
import { ThemedText } from './components/texts/ThemedText'
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
import { AutoLockTime, ActivityProvider, useActivity } from './contexts/activity'
import { AuthProvider } from './contexts/auth'
import NavContainer from './contexts/navigation'
import { NetworkProvider } from './contexts/network'
import { useTour } from './contexts/tour/tour-context'
import { TourProvider } from './contexts/tour/tour-provider'
import AttemptLockout from './screens/AttemptLockout'
import Developer from './screens/Developer'
import DeveloperModal from './components/modals/DeveloperModal'
import { useDeveloperMode } from './hooks/developer-mode'
import FauxHeader from './components/misc/FauxHeader'
import OnboardingPages from './screens/OnboardingPages'
import Preface from './screens/Preface'
import Splash from './screens/Splash'
import Terms from './screens/Terms'
import UpdateAvailable from './screens/UpdateAvailable'
import Biometry from './screens/Biometry'
import { loadLoginAttempt, isBiometricsActive } from './services/keychain'
import { BifoldLogger } from './services/logger'
import * as types from './types'
import Scan from './screens/Scan'
import Onboarding from './screens/Onboarding'
import { DefaultScreenOptionsDictionary, useDefaultStackOptions } from './navigators/defaultStackOptions'
import { PINRules, walletTimeout, tours, attemptLockoutConfig } from './constants'
import { CredentialListFooterProps } from './types/credential-list-footer'
import { OpenIDCredentialRecordProvider } from './modules/openid/context/OpenIDCredentialRecordProvider'
import { defaultConfig, defaultHistoryEventsLogger } from './container-impl'
import useBifoldAgentSetup from './hooks/useBifoldAgentSetup'
import usePreventScreenCapture from './hooks/screen-capture'
import { DefaultScreenLayoutOptions } from './navigators/defaultLayoutOptions'
import { DeepPartial, ThemeBuilder } from './theme-builder'

export * from './navigators'
export * from './services/storage'
export * from './types/attestation'
export * from './types/version-check'
export { LocalStorageKeys } from './constants'
export * from './services/storage'
export { initLanguages, initStoredLanguage, translationResources, Locales } from './localization'
export { defaultState, mergeReducers, StoreProvider, StoreContext, useStore } from './contexts/store'
export { default as Store, DispatchAction, reducer } from './contexts/reducers/store'
export { useDeepLinks } from './hooks/deep-links'
export { Assets as ImageAssets } from './theme'
export { ThemeProvider, useTheme } from './contexts/theme'
export { AnimatedComponentsProvider, useAnimatedComponents } from './contexts/animated-components'
export { ColorPalette } from './theme'
export { animatedComponents } from './animated-components'
export { bifoldTheme } from './theme'
export { useAuth } from './contexts/auth'
export { useNetwork } from './contexts/network'
export { testIdWithKey, testIdForAccessabilityLabel } from './utils/testable'
export { Screens, Stacks, TabStacks } from './types/navigators'
export { createStyles } from './screens/OnboardingPages'
export { statusBarStyleForColor, StatusBarStyles } from './utils/luminance'
export { BifoldError } from './types/error'
export { EventTypes } from './constants'
export { migrateToAskar } from './utils/migration'
export { createLinkSecretIfRequired, getAgentModules } from './utils/agent'
export {
  removeExistingInvitationsById,
  connectFromScanOrDeepLink,
  formatTime,
  useCredentialConnectionLabel,
  getConnectionName,
} from './utils/helpers'
export { isValidAnonCredsCredential, getCredentialIdentifiers } from './utils/credential'
export { buildFieldsFromAnonCredsCredential } from './utils/oca'

export type { AnimatedComponents } from './animated-components'
export type {
  ISVGAssets,
  ISpacing,
  IFontAttributes,
  IInputAttributes,
  IInlineInputMessage,
  IInputs,
  ITextTheme,
  ITabTheme,
  IBrandColors,
  ISemanticColors,
  INotificationColors,
  IErrorColors,
  IGrayscaleColors,
  IColorPalette,
  IAssets,
  ITheme,
} from './theme'
export type { basicMessageCustomMetadata, credentialCustomMetadata } from './types/metadata'
export { CredentialMetadata, BasicMessageMetadata } from './types/metadata'
export type { VersionInfo, PersistentState } from './types/state'
export type { BifoldAgent } from './utils/agent'
export type { TourStep, RenderProps } from './contexts/tour/tour-context'
export type { GenericFn } from './types/fn'
export type { OnboardingStackParams, NotificationStackParams, ContactStackParams } from './types/navigators'
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

export { InlineErrorPosition } from './types/error'

export type { CredentialListFooterProps }
export * from './container-api'
export { MainContainer } from './container-impl'

export type { ScreenLayoutConfig, OnboardingTask } from './types/navigators'
export type { Config, HistoryEventsLoggerConfig } from './types/config'

export { BaseTourID } from './types/tour'
export type { SplashProps } from './screens/Splash'
export type { OnboardingStackProps } from './navigators/OnboardingStack'
export { LockoutReason } from './contexts/auth'

export {
  createApp,
  Agent,
  AgentProvider,
  AuthProvider,
  NetworkProvider,
  TourProvider,
  useTour,
  AttachTourStep,
  TourBox,
  defaultConfig,
  defaultHistoryEventsLogger,
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
  SafeAreaModal,
  IconButton,
  ActivityProvider,
  useActivity,
  InfoTextBox,
  InfoBox,
  InfoBoxType,
  Link,
  AutoLockTime,
  ToastType,
  toastConfig,
  NavContainer,
  OnboardingPages,
  OpenIDCredentialRecordProvider,
  NotificationListItem,
  useDefaultStackOptions,
  useBifoldAgentSetup,
  usePreventScreenCapture,
  Splash,
  Developer,
  DeveloperModal,
  useDeveloperMode,
  FauxHeader,
  Terms,
  Preface,
  UpdateAvailable,
  HomeFooterView as HomeContentView,
  Biometry,
  AttemptLockout,
  Record,
  Scan,
  Onboarding,
  types,
  components,
  contexts,
  Text,
  ThemedText,
  loadLoginAttempt,
  isBiometricsActive,
  Button,
  BifoldLogger,
  LimitedTextInput,
  KeyboardView,
  BulletPoint,
  PINRules,
  walletTimeout,
  attemptLockoutConfig,
  tours,
  DefaultScreenOptionsDictionary,
  DefaultScreenLayoutOptions,
  ThemeBuilder,
}
export type { IButton, DeepPartial }
