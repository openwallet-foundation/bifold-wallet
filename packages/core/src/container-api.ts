import { Agent } from '@credo-ts/core'
import { IndyVdrPoolConfig } from '@credo-ts/indy-vdr'
import { ProofRequestTemplate } from '@bifold/verifier'
import { OCABundleResolverType } from '@bifold/oca/build/legacy'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { createContext, useContext } from 'react'
import { DependencyContainer } from 'tsyringe'

import { Button } from './components/buttons/Button-api'
import { ReducerAction } from './contexts/reducers/store'
import { IHistoryManager } from './modules/history'
import Onboarding from './screens/Onboarding'
import { SplashProps } from './screens/Splash'
import UpdateAvailable from './screens/UpdateAvailable'
import { AttestationMonitor } from './types/attestation'
import { IVersionCheckService } from './types/version-check'
import { GenericFn } from './types/fn'
import { OnboardingStackParams, ScreenLayoutConfig, ScreenOptionsType, OnboardingTask } from './types/navigators'
import { CustomNotification } from './types/notification'
import { Config, HistoryEventsLoggerConfig } from './types/config'
import { State } from './types/state'
import { NotificationReturnType, NotificationsInputProps } from './hooks/notifications'
import { NotificationListItemProps } from './components/listItems/NotificationListItem'
import { PINHeaderProps } from './components/misc/PINHeader'
import { PINExplainerProps } from './screens/PINExplainer'
import { CredentialListFooterProps } from './types/credential-list-footer'
import { ContactListItemProps } from './components/listItems/ContactListItem'
import { ContactCredentialListItemProps } from './components/listItems/ContactCredentialListItem'
import { InlineErrorConfig } from './types/error'
import { BifoldLogger } from './services/logger'
import { AgentSetupReturnType } from './hooks/useBifoldAgentSetup'
import { OnboardingStackProps } from './navigators/OnboardingStack'

export type FN_ONBOARDING_DONE = (
  dispatch: React.Dispatch<ReducerAction<unknown>>,
  navigation: StackNavigationProp<OnboardingStackParams>
) => GenericFn

type LoadStateFn = (dispatch: React.Dispatch<ReducerAction<unknown>>) => Promise<void>

type GenerateOnboardingWorkflowStepsFn = (
  state: State,
  config: Config,
  termsVersion: number,
  agent: Agent | null
) => Array<OnboardingTask>

type ProofRequestTemplateFn = (useDevTemplates: boolean) => Array<ProofRequestTemplate>

export const PROOF_TOKENS = {
  GROUP_BY_REFERENT: 'proof.groupByReferant',
  CRED_HELP_ACTION_OVERRIDES: 'proof.credHelpActionOverride',
} as const

export const SCREEN_TOKENS = {
  SCREEN_PREFACE: 'screen.preface',
  SCREEN_UPDATE_AVAILABLE: 'screen.update-available',
  SCREEN_TERMS: 'screen.terms',
  SCREEN_ONBOARDING: 'screen.onboarding',
  SCREEN_DEVELOPER: 'screen.developer',
  SCREEN_ONBOARDING_ITEM: 'screen.onboarding.item',
  SCREEN_ONBOARDING_PAGES: 'screen.onboarding.pages',
  SCREEN_SPLASH: 'screen.splash',
  SCREEN_SCAN: 'screen.scan',
  SCREEN_BIOMETRY: 'screen.biometry',
  SCREEN_TOGGLE_BIOMETRY: 'screen.toggle-biometry',
  SCREEN_PIN_EXPLAINER: 'screen.pin-explainer',
} as const

export const NAV_TOKENS = {
  CUSTOM_NAV_STACK_1: 'nav.slot1',
} as const

export const HOOK_TOKENS = {
  HOOK_USE_AGENT_SETUP: 'hook.useAgentSetup',
} as const

export const COMPONENT_TOKENS = {
  COMPONENT_HOME_HEADER: 'component.home.header',
  COMPONENT_HOME_NOTIFICATIONS_EMPTY_LIST: 'component.home.notifications-empty-list',
  COMPONENT_HOME_FOOTER: 'component.home.footer',
  COMPONENT_CRED_EMPTY_LIST: 'component.cred.empty-list',
  COMPONENT_RECORD: 'component.record',
  COMPONENT_PIN_HEADER: 'component.pin-create-header',
  COMPONENT_CONTACT_LIST_ITEM: 'component.contact-list-item',
  COMPONENT_CONTACT_DETAILS_CRED_LIST_ITEM: 'component.contact-details-cred-list-item',
  COMPONENT_CONNECTION_ALERT: 'component.connection-alert',
} as const

export const NOTIFICATION_TOKENS = {
  NOTIFICATIONS: 'notification.list',
  NOTIFICATIONS_LIST_ITEM: 'notification.list-item',
} as const

export const STACK_TOKENS = {
  STACK_ONBOARDING: 'stack.onboarding',
} as const

export const FN_TOKENS = {
  FN_ONBOARDING_DONE: 'fn.onboardingDone',
  COMPONENT_CRED_LIST_HEADER_RIGHT: 'fn.credListHeaderRight',
  COMPONENT_CRED_LIST_OPTIONS: 'fn.credListOptions',
  COMPONENT_CRED_LIST_FOOTER: 'fn.credListFooter',
} as const

export const HISTORY_TOKENS = {
  FN_LOAD_HISTORY: 'fn.loadHistory',
  HISTORY_ENABLED: 'history.enabled',
  HISTORY_EVENTS_LOGGER: 'history.eventsLogger',
} as const

export const COMP_TOKENS = {
  COMP_BUTTON: 'comp.button',
} as const

export const SERVICE_TOKENS = {
  SERVICE_TERMS: 'screen.terms',
} as const

export const LOAD_STATE_TOKENS = {
  LOAD_STATE: 'state.load',
} as const

export const OBJECT_TOKENS = {
  OBJECT_SCREEN_CONFIG: 'object.screen-config',
  OBJECT_LAYOUT_CONFIG: 'object.screenlayout-config',
} as const

export const CACHE_TOKENS = {
  CACHE_CRED_DEFS: 'cache.cred-defs',
  CACHE_SCHEMAS: 'cache.schemas',
} as const

export const UTILITY_TOKENS = {
  UTIL_LOGGER: 'utility.logger',
  UTIL_OCA_RESOLVER: 'utility.oca-resolver',
  UTIL_LEDGERS: 'utility.ledgers',
  UTIL_PROOF_TEMPLATE: 'utility.proof-template',
  UTIL_ATTESTATION_MONITOR: 'utility.attestation-monitor',
  UTIL_APP_VERSION_MONITOR: 'utility.app-version-monitor',
} as const

export const CONFIG_TOKENS = {
  CONFIG: 'config',
  INLINE_ERRORS: 'errors.inline',
  ONBOARDING: 'utility.onboarding',
} as const

export const TOKENS = {
  ...PROOF_TOKENS,
  ...COMPONENT_TOKENS,
  ...SCREEN_TOKENS,
  ...HOOK_TOKENS,
  ...NAV_TOKENS,
  ...SERVICE_TOKENS,
  ...STACK_TOKENS,
  ...NOTIFICATION_TOKENS,
  ...FN_TOKENS,
  ...COMP_TOKENS,
  ...LOAD_STATE_TOKENS,
  ...OBJECT_TOKENS,
  ...CACHE_TOKENS,
  ...UTILITY_TOKENS,
  ...CONFIG_TOKENS,
  ...HISTORY_TOKENS,
} as const

export type FN_HISTORY_MANAGER = (agent: Agent<any>) => IHistoryManager

export type TokenMapping = {
  [TOKENS.CRED_HELP_ACTION_OVERRIDES]: {
    credDefIds: string[]
    schemaIds: string[]
    action: (navigation: any) => void
  }[]
  [TOKENS.GROUP_BY_REFERENT]: boolean
  [TOKENS.SCREEN_PREFACE]: React.FC
  [TOKENS.SCREEN_UPDATE_AVAILABLE]: typeof UpdateAvailable
  [TOKENS.STACK_ONBOARDING]: React.FC<OnboardingStackProps>
  [TOKENS.SCREEN_TERMS]: { screen: React.FC; version: boolean | string }
  [TOKENS.SCREEN_DEVELOPER]: React.FC
  [TOKENS.SCREEN_ONBOARDING_PAGES]: (onTutorialCompleted: GenericFn, OnboardingTheme: any) => Array<Element>
  [TOKENS.SCREEN_SPLASH]: React.FC<SplashProps>
  [TOKENS.SCREEN_SCAN]: React.FC
  [TOKENS.SCREEN_BIOMETRY]: React.FC
  [TOKENS.SCREEN_TOGGLE_BIOMETRY]: React.FC
  [TOKENS.SCREEN_ONBOARDING]: typeof Onboarding
  [TOKENS.SCREEN_PIN_EXPLAINER]: React.FC<PINExplainerProps>
  [TOKENS.HOOK_USE_AGENT_SETUP]: () => AgentSetupReturnType
  [TOKENS.FN_ONBOARDING_DONE]: FN_ONBOARDING_DONE
  [TOKENS.LOAD_STATE]: LoadStateFn
  [TOKENS.COMP_BUTTON]: Button
  [TOKENS.NOTIFICATIONS]: {
    useNotifications: ({ openIDUri }: NotificationsInputProps) => NotificationReturnType
    customNotificationConfig?: CustomNotification
  }
  [TOKENS.NOTIFICATIONS_LIST_ITEM]: React.FC<NotificationListItemProps>
  [TOKENS.OBJECT_SCREEN_CONFIG]: ScreenOptionsType
  [TOKENS.OBJECT_LAYOUT_CONFIG]: ScreenLayoutConfig
  [TOKENS.COMPONENT_PIN_HEADER]: React.FC<PINHeaderProps>
  [TOKENS.CACHE_CRED_DEFS]: { did: string; id: string }[]
  [TOKENS.CACHE_SCHEMAS]: { did: string; id: string }[]
  [TOKENS.UTIL_LOGGER]: BifoldLogger
  [TOKENS.UTIL_OCA_RESOLVER]: OCABundleResolverType
  [TOKENS.UTIL_LEDGERS]: IndyVdrPoolConfig[]
  [TOKENS.UTIL_PROOF_TEMPLATE]: ProofRequestTemplateFn | undefined
  [TOKENS.UTIL_ATTESTATION_MONITOR]: AttestationMonitor
  [TOKENS.UTIL_APP_VERSION_MONITOR]: IVersionCheckService
  [TOKENS.FN_LOAD_HISTORY]: FN_HISTORY_MANAGER
  [TOKENS.HISTORY_ENABLED]: boolean
  [TOKENS.HISTORY_EVENTS_LOGGER]: HistoryEventsLoggerConfig
  [TOKENS.CONFIG]: Config
  [TOKENS.ONBOARDING]: GenerateOnboardingWorkflowStepsFn
  [TOKENS.COMPONENT_CRED_LIST_HEADER_RIGHT]: React.FC
  [TOKENS.COMPONENT_CRED_LIST_OPTIONS]: React.FC
  [TOKENS.COMPONENT_CRED_LIST_FOOTER]: React.FC<CredentialListFooterProps>
  [TOKENS.COMPONENT_HOME_HEADER]: React.FC
  [TOKENS.COMPONENT_HOME_NOTIFICATIONS_EMPTY_LIST]: React.FC
  [TOKENS.COMPONENT_HOME_FOOTER]: React.FC
  [TOKENS.COMPONENT_CRED_EMPTY_LIST]: React.FC
  [TOKENS.COMPONENT_RECORD]: React.FC
  [TOKENS.COMPONENT_CONTACT_LIST_ITEM]: React.FC<ContactListItemProps>
  [TOKENS.COMPONENT_CONTACT_DETAILS_CRED_LIST_ITEM]: React.FC<ContactCredentialListItemProps>
  [TOKENS.INLINE_ERRORS]: InlineErrorConfig
  [TOKENS.CUSTOM_NAV_STACK_1]: React.FC
  [TOKENS.COMPONENT_CONNECTION_ALERT]: React.FC<{ connectionLabel?: string }>
}

export interface Container {
  init(): Container
  resolve<K extends keyof TokenMapping>(token: K): TokenMapping[K]
  resolveAll<K extends keyof TokenMapping, T extends K[]>(tokens: [...T]): { [I in keyof T]: TokenMapping[T[I]] }
  get container(): DependencyContainer
}

export const ContainerContext = createContext<Container | undefined>(undefined)

export const ContainerProvider = ContainerContext.Provider

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const useContainer = () => useContext(ContainerContext)!

export const useServices = <K extends keyof TokenMapping, T extends K[]>(tokens: [...T]) => {
  return useContainer().resolveAll(tokens)
}
