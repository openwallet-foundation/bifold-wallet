import {
  Agent,
  BaseLogger,
  BasicMessageRecord,
  ProofExchangeRecord,
  CredentialExchangeRecord as CredentialRecord,
} from '@credo-ts/core'
import { IndyVdrPoolConfig } from '@credo-ts/indy-vdr'
import { ProofRequestTemplate } from '@hyperledger/aries-bifold-verifier'
import { OCABundleResolverType } from '@hyperledger/aries-oca/build/legacy'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { createContext, useContext } from 'react'
import { DependencyContainer } from 'tsyringe'

import { Button } from './components/buttons/Button-api'
import { ReducerAction } from './contexts/reducers/store'
import { IHistoryManager } from './modules/history'
import Onboarding from './screens/Onboarding'
import { AttestationMonitor } from './types/attestation'
import { GenericFn } from './types/fn'
import { AuthenticateStackParams, ScreenOptionsType } from './types/navigators'
import { CustomNotification } from './types/notification'

export type FN_ONBOARDING_DONE = (
  dispatch: React.Dispatch<ReducerAction<unknown>>,
  navigation: StackNavigationProp<AuthenticateStackParams>
) => GenericFn

type LoadStateFn = (dispatch: React.Dispatch<ReducerAction<unknown>>) => Promise<void>

type ProofRequestTemplateFn = (useDevTemplates: boolean) => Array<ProofRequestTemplate>

export const PROOF_TOKENS = {
  GROUP_BY_REFERENT: 'proof.groupByReferant',
  CRED_HELP_ACTION_OVERRIDES: 'proof.credHelpActionOverride',
} as const

export const SCREEN_TOKENS = {
  SCREEN_PREFACE: 'screen.preface',
  SCREEN_TERMS: 'screen.terms',
  SCREEN_ONBOARDING: 'screen.onboarding',
  SCREEN_DEVELOPER: 'screen.developer',
  SCREEN_ONBOARDING_ITEM: 'screen.onboarding.item',
} as const

export const NOTIFICATION_TOKENS = {
  NOTIFICATIONS: 'notification.list',
} as const

export const STACK_TOKENS = {
  STACK_ONBOARDING: 'stack.onboarding',
} as const

export const FN_TOKENS = {
  FN_ONBOARDING_DONE: 'fn.onboardingDone',
  FN_LOAD_HISTORY: 'fn.loadHistory',
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
  OBJECT_ONBOARDING_CONFIG: 'object.onboarding-config',
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
} as const

export const TOKENS = {
  ...PROOF_TOKENS,
  ...SCREEN_TOKENS,
  ...SERVICE_TOKENS,
  ...STACK_TOKENS,
  ...NOTIFICATION_TOKENS,
  ...FN_TOKENS,
  ...COMP_TOKENS,
  ...LOAD_STATE_TOKENS,
  ...OBJECT_TOKENS,
  ...CACHE_TOKENS,
  ...UTILITY_TOKENS,
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
  [TOKENS.STACK_ONBOARDING]: React.FC
  [TOKENS.SCREEN_TERMS]: { screen: React.FC; version: boolean | string }
  [TOKENS.SCREEN_DEVELOPER]: React.FC
  [TOKENS.SCREEN_ONBOARDING]: typeof Onboarding
  [TOKENS.FN_ONBOARDING_DONE]: FN_ONBOARDING_DONE
  [TOKENS.LOAD_STATE]: LoadStateFn
  [TOKENS.COMP_BUTTON]: Button
  [TOKENS.NOTIFICATIONS]: {
    useNotifications: () => Array<BasicMessageRecord | CredentialRecord | ProofExchangeRecord | CustomNotification>
    customNotificationConfig?: CustomNotification
  }
  [TOKENS.OBJECT_ONBOARDING_CONFIG]: ScreenOptionsType
  [TOKENS.CACHE_CRED_DEFS]: { did: string; id: string }[]
  [TOKENS.CACHE_SCHEMAS]: { did: string; id: string }[]
  [TOKENS.UTIL_LOGGER]: BaseLogger
  [TOKENS.UTIL_OCA_RESOLVER]: OCABundleResolverType
  [TOKENS.UTIL_LEDGERS]: IndyVdrPoolConfig[]
  [TOKENS.UTIL_PROOF_TEMPLATE]: ProofRequestTemplateFn | undefined
  [TOKENS.UTIL_ATTESTATION_MONITOR]: AttestationMonitor
  [TOKENS.FN_LOAD_HISTORY]: FN_HISTORY_MANAGER
}

export interface Container {
  init(): Container
  resolve<K extends keyof TokenMapping>(token: K): TokenMapping[K]
  get container(): DependencyContainer
}

export const ContainerContext = createContext<Container | undefined>(undefined)

export const ContainerProvider = ContainerContext.Provider

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const useContainer = () => useContext(ContainerContext)!
