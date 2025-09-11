/* eslint-disable import/no-cycle */
import type { OnboardingStyleSheet } from './screens/Onboarding'

import { Agent } from '@credo-ts/core'
import AgentProvider from '@credo-ts/react-hooks'

import createApp from './App'
import * as components from './components'
import { ButtonImpl as Button, ButtonType, Button as IButton } from './components/buttons/Button'
import IconButton, { ButtonLocation } from './components/buttons/IconButton'
import BulletPoint from './components/inputs/BulletPoint'
import CheckBoxRow from './components/inputs/CheckBoxRow'
import LimitedTextInput from './components/inputs/LimitedTextInput'
import NotificationListItem from './components/listItems/NotificationListItem'
import ContentGradient from './components/misc/ContentGradient'
import CredentialCard from './components/misc/CredentialCard'
import ErrorBoundaryWrapper from './components/misc/ErrorBoundary'
import FauxHeader from './components/misc/FauxHeader'
import InfoBox, { InfoBoxType } from './components/misc/InfoBox'
import QRScannerTorch from './components/misc/QRScannerTorch'
import DeveloperModal from './components/modals/DeveloperModal'
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
import { Banner, BannerMessage, BannerSection } from './components/views/Banner'
import HomeFooterView from './components/views/HomeFooterView'
import KeyboardView from './components/views/KeyboardView'
import { attemptLockoutConfig, PINRules, tours, walletTimeout } from './constants'
import { defaultConfig, defaultHistoryEventsLogger } from './container-impl'
import * as contexts from './contexts'
import { ActivityProvider, AutoLockTime, useActivity } from './contexts/activity'
import { AuthProvider } from './contexts/auth'
import NavContainer from './contexts/navigation'
import { NetworkProvider } from './contexts/network'
import { useTour } from './contexts/tour/tour-context'
import { TourProvider } from './contexts/tour/tour-provider'
import { useDeveloperMode } from './hooks/developer-mode'
import usePreventScreenCapture from './hooks/screen-capture'
import useBifoldAgentSetup from './hooks/useBifoldAgentSetup'
import { OpenIDCredentialRecordProvider } from './modules/openid/context/OpenIDCredentialRecordProvider'
import { DefaultScreenLayoutOptions } from './navigators/defaultLayoutOptions'
import { DefaultScreenOptionsDictionary, useDefaultStackOptions } from './navigators/defaultStackOptions'
import AttemptLockout from './screens/AttemptLockout'
import Biometry from './screens/Biometry'
import Developer from './screens/Developer'
import Onboarding from './screens/Onboarding'
import OnboardingPages from './screens/OnboardingPages'
import Preface from './screens/Preface'
import Scan from './screens/Scan'
import Splash from './screens/Splash'
import Terms from './screens/Terms'
import UpdateAvailable from './screens/UpdateAvailable'
import { bifoldLoggerInstance } from './services/bifoldLogger'
import { isBiometricsActive, loadLoginAttempt } from './services/keychain'
import { BifoldLogger } from './services/logger'
import { AbstractBifoldLogger } from './services/AbstractBifoldLogger'
import { DeepPartial, ThemeBuilder } from './theme-builder'
import * as types from './types'
import { CredentialListFooterProps } from './types/credential-list-footer'

export { animatedComponents } from './animated-components'
export { EventTypes, LocalStorageKeys } from './constants'
export { AnimatedComponentsProvider, useAnimatedComponents } from './contexts/animated-components'
export { useAuth } from './contexts/auth'
export { useNetwork } from './contexts/network'
export { DispatchAction, reducer, default as Store } from './contexts/reducers/store'
export { defaultState, mergeReducers, StoreContext, StoreProvider, useStore } from './contexts/store'
export { ThemeProvider, useTheme } from './contexts/theme'
export { useDeepLinks } from './hooks/deep-links'
export { initLanguages, initStoredLanguage, Locales, translationResources } from './localization'
export * from './navigators'
export { createStyles } from './screens/OnboardingPages'
export * from './services/storage'
export { bifoldTheme, ColorPalette, Assets as ImageAssets } from './theme'
export * from './types/attestation'
export { BifoldError } from './types/error'
export { Screens, Stacks, TabStacks } from './types/navigators'
export * from './types/version-check'
export { createLinkSecretIfRequired, getAgentModules } from './utils/agent'
export { getCredentialIdentifiers, isValidAnonCredsCredential } from './utils/credential'
export {
  connectFromScanOrDeepLink,
  formatTime,
  getConnectionName,
  removeExistingInvitationsById,
  useCredentialConnectionLabel,
} from './utils/helpers'
export { getIndyLedgers, IndyLedger, readIndyLedgersFromFile, writeIndyLedgersToFile } from './utils/ledger'
export { statusBarStyleForColor, StatusBarStyles } from './utils/luminance'
export { migrateToAskar } from './utils/migration'
export { buildFieldsFromAnonCredsCredential } from './utils/oca'
export { testIdForAccessabilityLabel, testIdWithKey } from './utils/testable'

export type { AnimatedComponents } from './animated-components'
export type { ReducerAction } from './contexts/reducers/store'
export type { RenderProps, TourStep } from './contexts/tour/tour-context'
export type {
  IAssets,
  IBrandColors,
  IColorPalette,
  IErrorColors,
  IFontAttributes,
  IGrayscaleColors,
  IInlineInputMessage,
  IInputAttributes,
  IInputs,
  INotificationColors,
  ISemanticColors,
  ISpacing,
  ISVGAssets,
  ITabTheme,
  ITextTheme,
  ITheme,
} from './theme'
export type { GenericFn } from './types/fn'
export { BasicMessageMetadata, CredentialMetadata } from './types/metadata'
export type { basicMessageCustomMetadata, credentialCustomMetadata } from './types/metadata'
export type { ContactStackParams, NotificationStackParams, OnboardingStackParams } from './types/navigators'
export type { WalletSecret } from './types/security'
export type {
  LoginAttempt as LoginAttemptState,
  Migration as MigrationState,
  Onboarding as OnboardingState,
  PersistentState,
  Preferences as PreferencesState,
  State,
  Tours as ToursState,
  VersionInfo,
} from './types/state'
export type { BifoldAgent } from './utils/agent'
export type { IndyLedgerConfig, IndyLedgerFileSystem, IndyLedgerJSON, IndyLedgersRecord } from './utils/ledger'
export type { OnboardingStyleSheet }

export type { InlineMessageProps } from './components/inputs/InlineErrorText'

export { InlineErrorPosition } from './types/error'

export * from './container-api'
export { MainContainer } from './container-impl'
export type { CredentialListFooterProps }

export type { Config, HistoryEventsLoggerConfig } from './types/config'
export type { OnboardingTask, ScreenLayoutConfig } from './types/navigators'

export { LockoutReason } from './contexts/auth'
export type { OnboardingStackProps } from './navigators/OnboardingStack'
export type { SplashProps } from './screens/Splash'
export { BaseTourID } from './types/tour'

export type { BannerSectionProps } from './components/views/Banner'

export {
  ActivityProvider,
  Agent,
  AgentProvider,
  AttachTourStep,
  AttemptLockout,
  attemptLockoutConfig,
  AuthProvider,
  AutoLockTime,
  Banner,
  BannerSection,
  AbstractBifoldLogger,
  BifoldLogger,
  bifoldLoggerInstance,
  Biometry,
  BulletPoint,
  Button,
  ButtonLocation,
  ButtonType,
  CheckBoxRow,
  components,
  ContentGradient,
  contexts,
  createApp,
  CredentialCard,
  credentialOfferTourSteps,
  credentialsTourSteps,
  defaultConfig,
  defaultHistoryEventsLogger,
  DefaultScreenLayoutOptions,
  DefaultScreenOptionsDictionary,
  Developer,
  DeveloperModal,
  ErrorBoundaryWrapper,
  ErrorModal,
  FauxHeader,
  HomeFooterView as HomeContentView,
  homeTourSteps,
  IconButton,
  InfoBox,
  InfoBoxType,
  InfoTextBox,
  isBiometricsActive,
  KeyboardView,
  LimitedTextInput,
  Link,
  loadLoginAttempt,
  NavContainer,
  NetworkProvider,
  NotificationListItem,
  Onboarding,
  OnboardingPages,
  OpenIDCredentialRecordProvider,
  PINRules,
  Preface,
  proofRequestTourSteps,
  QRScannerTorch,
  Record,
  SafeAreaModal,
  Scan,
  Splash,
  Terms,
  Text,
  ThemeBuilder,
  ThemedText,
  toastConfig,
  ToastType,
  TourBox,
  TourProvider,
  tours,
  types,
  UpdateAvailable,
  useActivity,
  useBifoldAgentSetup,
  useDefaultStackOptions,
  useDeveloperMode,
  usePreventScreenCapture,
  useTour,
  walletTimeout,
}
export type { BannerMessage, DeepPartial, IButton }
