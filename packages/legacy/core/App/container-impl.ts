import { StackNavigationProp } from '@react-navigation/stack'
import { createContext, useContext } from 'react'
import { DependencyContainer } from 'tsyringe'

import Button from './components/buttons/Button'
import { TOKENS, System, TokenMapping } from './container-api'
import { DispatchAction, ReducerAction } from './contexts/reducers/store'
import OnboardingStack from './navigators/OnboardingStack'
import Onboarding from './screens/Onboarding'
import ScreenTerms from './screens/Terms'
import { AuthenticateStackParams, Screens } from './types/navigators'

export class MainSystem implements System {
  public static readonly TOKENS = TOKENS
  private container: DependencyContainer
  public constructor(container: DependencyContainer) {
    this.container = container
  }
  public init(): System {
    // eslint-disable-next-line no-console
    console.log(`initializing System`)
    this.container.registerInstance(TOKENS.SCREEN_TERMS, ScreenTerms)
    this.container.registerInstance(TOKENS.SCREEN_ONBOARDING, Onboarding)
    this.container.registerInstance(TOKENS.STACK_ONBOARDING, OnboardingStack)
    this.container.registerInstance(TOKENS.COMP_BUTTON, Button)

    this.container.registerInstance(
      TOKENS.FN_ONBOARDING_DONE,
      (dispatch: React.Dispatch<ReducerAction<unknown>>, navigation: StackNavigationProp<AuthenticateStackParams>) => {
        return () => {
          dispatch({
            type: DispatchAction.DID_COMPLETE_TUTORIAL,
          })
          navigation.navigate(Screens.Terms)
        }
      }
    )
    return this
  }
  public resolve<K extends keyof TokenMapping>(token: K): TokenMapping[K] {
    // eslint-disable-next-line no-console
    console.log(`resolving ${token}`)
    return this.container.resolve(token) as TokenMapping[K]
  }
}

export const SystemContext = createContext<System | undefined>(undefined)

export const SystemProvider = SystemContext.Provider

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const useSystem = () => useContext(SystemContext)!
