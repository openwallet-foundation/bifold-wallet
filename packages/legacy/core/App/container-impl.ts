import { StackNavigationProp } from '@react-navigation/stack'
import { createContext, useContext } from 'react'
import { DependencyContainer } from 'tsyringe'

import Button from './components/buttons/Button'
import { TOKENS, Container, TokenMapping } from './container-api'
import { DispatchAction, ReducerAction } from './contexts/reducers/store'
import OnboardingStack from './navigators/OnboardingStack'
import { DefaultScreenOptionsDictionary } from './navigators/defaultStackOptions'
import Developer from './screens/Developer'
import Onboarding from './screens/Onboarding'
import Preface from './screens/Preface'
import ScreenTerms, { TermsVersion } from './screens/Terms'
import { AuthenticateStackParams, Screens } from './types/navigators'

export class MainContainer implements Container {
  public static readonly TOKENS = TOKENS
  private container: DependencyContainer
  public constructor(container: DependencyContainer) {
    this.container = container
  }
  public init(): Container {
    // eslint-disable-next-line no-console
    console.log(`Initializing Bifold container`)
    this.container.registerInstance(TOKENS.SCREEN_PREFACE, Preface)
    this.container.registerInstance(TOKENS.SCREEN_DEVELOPER, Developer)
    this.container.registerInstance(TOKENS.SCREEN_TERMS, { screen: ScreenTerms, version: TermsVersion })
    this.container.registerInstance(TOKENS.SCREEN_ONBOARDING, Onboarding)
    this.container.registerInstance(TOKENS.STACK_ONBOARDING, OnboardingStack)
    this.container.registerInstance(TOKENS.COMP_BUTTON, Button)
    this.container.registerInstance(TOKENS.OBJECT_ONBOARDINGCONFIG, DefaultScreenOptionsDictionary)

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

  public getContainer(): DependencyContainer {
    return this.container
  }
}

export const SystemContext = createContext<Container | undefined>(undefined)

export const SystemProvider = SystemContext.Provider

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const useSystem = () => useContext(SystemContext)!
