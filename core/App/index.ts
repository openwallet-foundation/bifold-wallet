/* eslint-disable import/no-cycle */
import type { OnboardingStyleSheet } from './screens/Onboarding'

import { Agent } from '@aries-framework/core'
import AgentProvider from '@aries-framework/react-hooks'

import indyLedgers from '../configs/ledgers/indy'

import LoadingIndicator from './components/animated/LoadingIndicator'
import Button, { ButtonType } from './components/buttons/Button'
import CheckBoxRow from './components/inputs/CheckBoxRow'
import ErrorModal from './components/modals/ErrorModal'
import NetInfo from './components/network/NetInfo'
import Record from './components/record/Record'
import InfoTextBox from './components/texts/InfoTextBox'
import { ToastType } from './components/toast/BaseToast'
import toastConfig from './components/toast/ToastConfig'
import HomeContentView from './components/views/HomeContentView'
import { AuthProvider } from './contexts/auth'
import { NetworkProvider } from './contexts/network'
import { defaultConfiguration } from './defaultConfiguration'
import RootStack from './navigators/RootStack'
import AttemptLockout from './screens/AttemptLockout'
import OnboardingPages from './screens/OnboardingPages'
import Splash from './screens/Splash'
import Terms from './screens/Terms'
import UseBiometry from './screens/UseBiometry'
import * as types from './types'

export { LocalStorageKeys } from './constants'
export { initLanguages, initStoredLanguage, translationResources } from './localization'
export { ConfigurationProvider, useConfiguration } from './contexts/configuration'
export { StoreProvider, StoreContext, useStore } from './contexts/store'
export { DispatchAction } from './contexts/reducers/store'
export { ThemeProvider, useTheme } from './contexts/theme'
export { ColorPallet } from './theme'
export { theme } from './theme'
export { useAuth } from './contexts/auth'
export { NavigationTheme } from './theme'
export { testIdWithKey } from './utils/testable'
export { Screens, Stacks } from './types/navigators'
export { createStyles } from './screens/OnboardingPages'
export { statusBarStyleForColor, StatusBarStyles } from './utils/luminance'
export { BifoldError } from './types/error'

export type { Theme } from './theme'
export type { ConfigurationContext } from './contexts/configuration'
export type { Onboarding as OnboardingState } from './types/state'
export type { Privacy as PrivacyState } from './types/state'
export type { Preferences as PreferencesState } from './types/state'
export type { LoginAttempt as LoginAttemptState } from './types/state'
export type { GenericFn } from './types/fn'
export type { AuthenticateStackParams } from './types/navigators'
export type { OnboardingStyleSheet }
export type { WalletSecret } from './types/security'

export {
  LoadingIndicator,
  indyLedgers,
  Agent,
  AgentProvider,
  AuthProvider,
  NetworkProvider,
  Button,
  ButtonType,
  CheckBoxRow,
  ErrorModal,
  InfoTextBox,
  ToastType,
  toastConfig,
  RootStack,
  NetInfo,
  OnboardingPages,
  Splash,
  Terms,
  HomeContentView,
  UseBiometry,
  AttemptLockout,
  Record,
  defaultConfiguration,
  types,
}
