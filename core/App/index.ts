/* eslint-disable import/no-cycle */
import type { OnboardingStyleSheet } from './screens/Onboarding'

import { Agent } from '@aries-framework/core'
import AgentProvider from '@aries-framework/react-hooks'

export { DispatchAction } from './contexts/reducers/store'

import { InfoTextBox, CheckBoxRow } from './components'
import Button, { ButtonType } from './components/buttons/Button'
export { testIdWithKey } from './utils/testable'
export { default as toastConfig } from './components/toast/ToastConfig'
export { initLanguages, initStoredLanguage, translationResources } from './localization'
import RootStack from './navigators/RootStack'
import OnboardingPages from './screens/OnboardingPages'
import Splash from './screens/Splash'
import Terms from './screens/Terms'
export { ColorPallet } from './theme'
export { default as indyLedgers } from '../configs/ledgers/indy'
export { default as ErrorModal } from './components/modals/ErrorModal'
export { StoreProvider, StoreContext } from './contexts/store'
export type { StoreProviderProps } from './contexts/store'
export { defaultTheme } from './theme'
export type { Theme } from './theme'
export { ThemeProvider, useThemeContext } from './utils/themeContext'
export { ConfigurationProvider, useConfiguration } from './contexts/configuration'
export type { ConfigurationContext } from './contexts/configuration'
export { default as defaultTerms } from './screens/Terms'

export { createStyles } from './screens/OnboardingPages'

export { LocalStorageKeys } from './constants'
export type { GenericFn } from './types/fn'

export type { Onboarding as OnboardingState } from './types/state'
export { Screens } from './types/navigators'
export type { AuthenticateStackParams } from './types/navigators'

export { InfoTextBox, CheckBoxRow, Button, ButtonType, RootStack, Agent, AgentProvider, OnboardingPages, Splash, Terms }

export type { OnboardingStyleSheet }
