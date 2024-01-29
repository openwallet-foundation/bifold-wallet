import { StackNavigationProp } from '@react-navigation/stack'
import { createContext, useContext } from 'react'

import { Button } from './components/buttons/Button-api'
import { ReducerAction } from './contexts/reducers/store'
import Onboarding from './screens/Onboarding'
import { GenericFn } from './types/fn'
import { AuthenticateStackParams } from './types/navigators'

export enum SCREEN_TOKENS {
  SCREEN_TERMS = 'screen.terms',
  SCREEN_ONBOARDING = 'screen.onboarding',
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
  [TOKENS.STACK_ONBOARDING]: React.FC
  [TOKENS.SCREEN_TERMS]: React.FC
  [TOKENS.SCREEN_ONBOARDING]: typeof Onboarding
  [TOKENS.FN_ONBOARDING_DONE]: FN_ONBOARDING_DONE
  [TOKENS.COMP_BUTTON]: Button
}

export interface System {
  init(): System
  resolve<K extends keyof TokenMapping>(token: K): TokenMapping[K]
}

export const SystemContext = createContext<System | undefined>(undefined)

export const SystemProvider = SystemContext.Provider

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const useContainer = () => useContext(SystemContext)!
