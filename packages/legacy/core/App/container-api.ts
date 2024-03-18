import { StackNavigationProp } from '@react-navigation/stack'
import React, { createContext, useContext } from 'react'
import { DependencyContainer } from 'tsyringe'

import { Button } from './components/buttons/Button-api'
import { ReducerAction } from './contexts/reducers/store'
import Onboarding from './screens/Onboarding'
import { GenericFn } from './types/fn'
import { AuthenticateStackParams } from './types/navigators'

export enum SCREEN_TOKENS {
  SCREEN_PREFACE = 'screen.preface',
  SCREEN_TERMS = 'screen.terms',
  SCREEN_ONBOARDING = 'screen.onboarding',
  SCREEN_DEVELOPER = 'screen.developer',
  SCREEN_ONBOARDING_ITEM = 'screen.onboarding.item',
}
export enum STACK_TOKENS {
  STACK_ONBOARDING = 'stack.onboarding',
}
export enum FN_TOKENS {
  FN_ONBOARDING_DONE = 'fn.onboardingDone',
}

export enum COMP_TOKENS {
  COMP_BUTTON = 'comp.button',
}

export enum SERVICE_TOKENS {
  SERVICE_TERMS = 'screen.terms',
}

export const TOKENS = { ...SCREEN_TOKENS, ...SERVICE_TOKENS, ...STACK_TOKENS, ...FN_TOKENS, ...COMP_TOKENS }

export type FN_ONBOARDING_DONE = (
  dispatch: React.Dispatch<ReducerAction<unknown>>,
  navigation: StackNavigationProp<AuthenticateStackParams>
) => GenericFn

export interface TokenMapping {
  [TOKENS.SCREEN_PREFACE]: React.FC
  [TOKENS.STACK_ONBOARDING]: React.FC
  [TOKENS.SCREEN_TERMS]: { screen: React.FC; version: boolean | string }
  [TOKENS.SCREEN_DEVELOPER]: React.FC
  [TOKENS.SCREEN_ONBOARDING]: typeof Onboarding
  [TOKENS.FN_ONBOARDING_DONE]: FN_ONBOARDING_DONE
  [TOKENS.COMP_BUTTON]: Button
}

export interface Container {
  init(): Container
  resolve<K extends keyof TokenMapping>(token: K): TokenMapping[K]
  getContainer(): DependencyContainer
}

export const ContainerContext = createContext<Container | undefined>(undefined)

export const ContainerProvider = ContainerContext.Provider

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const useContainer = () => useContext(ContainerContext)!
