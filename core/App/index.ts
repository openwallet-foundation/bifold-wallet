/* eslint-disable import/no-cycle */
import type { OnboardingStyleSheet } from './screens/Onboarding'

import { Agent } from '@aries-framework/core'
import AgentProvider from '@aries-framework/react-hooks'

import indyLedgers from '../configs/ledgers/indy'

import Button, { ButtonType } from './components/buttons/Button'
import CheckBoxRow from './components/inputs/CheckBoxRow'
import InfoTextBox from './components/misc/InfoBox'
import ErrorModal from './components/modals/ErrorModal'
import toastConfig from './components/toast/ToastConfig'
import RootStack from './navigators/RootStack'
import OnboardingPages from './screens/OnboardingPages'
import Splash from './screens/Splash'
import Terms from './screens/Terms'

export { LocalStorageKeys } from './constants'
export { initLanguages, initStoredLanguage, translationResources } from './localization'
export { ConfigurationProvider, useConfiguration } from './contexts/configuration'
export { StoreProvider, StoreContext } from './contexts/store'
export { DispatchAction } from './contexts/reducers/store'
export { ThemeProvider, useTheme } from './contexts/theme'
export { ColorPallet } from './theme'
export { theme } from './theme'
export { testIdWithKey } from './utils/testable'
export { Screens } from './types/navigators'
export { createStyles } from './screens/OnboardingPages'

export type { StoreProviderProps } from './contexts/store'
export type { Theme } from './theme'
export type { ConfigurationContext } from './contexts/configuration'
export type { Onboarding as OnboardingState } from './types/state'
export type { GenericFn } from './types/fn'
export type { AuthenticateStackParams } from './types/navigators'
export type { OnboardingStyleSheet }

export {
  indyLedgers,
  Agent,
  AgentProvider,
  Button,
  ButtonType,
  CheckBoxRow,
  InfoTextBox,
  ErrorModal,
  toastConfig,
  RootStack,
  OnboardingPages,
  Splash,
  Terms,
}
