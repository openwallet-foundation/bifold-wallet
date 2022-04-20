/* eslint-disable import/no-cycle */
import type { OnboardingStyleSheet } from './screens/Onboarding'

import { Agent } from '@aries-framework/core'
import AgentProvider from '@aries-framework/react-hooks'

export { DispatchAction } from './store/reducer'

import { InfoTextBox, CheckBoxRow } from './components'
import Button, { ButtonType } from './components/buttons/Button'
export { testIdWithKey } from './utils/testable'
export { default as toastConfig } from './components/toast/ToastConfig'
export { initLanguages, initStoredLanguage, defaultTranslationResources } from './localization'
import RootStack from './navigators/RootStack'
export { ColorPallet, NavigationTheme } from './theme'
export { default as indyLedgers } from '../configs/ledgers/indy'
export { default as ErrorModal } from './components/modals/ErrorModal'
import StoreProvider, { Context as StoreContext, StoreProviderProps } from './store/Store'

export { defaultTheme } from './theme'
export type { Theme } from './theme'
export { ThemeProvider, useThemeContext } from './utils/themeContext'
export { ConfigurationProvider, useConfigurationContext } from './utils/configurationContext'
export type { ConfigurationContext } from './utils/configurationContext'
export { default as defaultTerms } from './screens/Terms'
export { default as defaultSplashScreen } from './screens/Splash'

export { pages as defaultOnboardingPages, createStyle as createOnboardingPagesStye } from './screens/OnboardingPages'

export { LocalStorageKeys } from './constants'
export type { GenericFn } from './types/fn'

export type { Onboarding as OnboardingState } from './types/state'
export { Screens } from './types/navigators'
export type { AuthenticateStackParams } from './types/navigators'

export { InfoTextBox, CheckBoxRow, Button, ButtonType, StoreProvider, StoreContext, RootStack, Agent, AgentProvider }

export type { OnboardingStyleSheet, StoreProviderProps }
