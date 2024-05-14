import { DefaultOCABundleResolver } from '@hyperledger/aries-oca/build/legacy'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { StackNavigationProp } from '@react-navigation/stack'
import { createContext, useContext } from 'react'
import { DependencyContainer } from 'tsyringe'

import * as bundle from './assets/oca-bundles.json'
import Button from './components/buttons/Button'
import defaultIndyLedgers from './configs/ledgers/indy'
import { LocalStorageKeys } from './constants'
import { TOKENS, Container, TokenMapping } from './container-api'
import { DispatchAction, ReducerAction } from './contexts/reducers/store'
import { defaultState } from './contexts/store'
import OnboardingStack from './navigators/OnboardingStack'
import { DefaultScreenOptionsDictionary } from './navigators/defaultStackOptions'
import Developer from './screens/Developer'
import Onboarding from './screens/Onboarding'
import Preface from './screens/Preface'
import ScreenTerms, { TermsVersion } from './screens/Terms'
import { loadLoginAttempt } from './services/keychain'
import { ConsoleLogger } from './services/logger'
import { AuthenticateStackParams, Screens } from './types/navigators'
import {
  Migration as MigrationState,
  Preferences as PreferencesState,
  State,
  Onboarding as StoreOnboardingState,
  Tours as ToursState,
} from './types/state'

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
    this.container.registerInstance(TOKENS.GROUP_BY_REFERENT, false)
    this.container.registerInstance(TOKENS.OBJECT_ONBOARDINGCONFIG, DefaultScreenOptionsDictionary)
    this.container.registerInstance(TOKENS.UTIL_LOGGER, new ConsoleLogger())
    this.container.registerInstance(TOKENS.UTIL_OCA_RESOLVER, new DefaultOCABundleResolver(bundle))
    this.container.registerInstance(TOKENS.UTIL_LEDGERS, defaultIndyLedgers)
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

    this.container.registerInstance(TOKENS.LOAD_STATE, async (dispatch: React.Dispatch<ReducerAction<unknown>>) => {
      const loadState = async <Type>(key: LocalStorageKeys, updateVal: (newVal: Type) => void) => {
        const data = await AsyncStorage.getItem(key)
        if (data) {
          const dataAsJSON = JSON.parse(data) as Type
          updateVal(dataAsJSON)
        }
      }

      let loginAttempt = defaultState.loginAttempt
      let preferences = defaultState.preferences
      let migration = defaultState.migration
      let tours = defaultState.tours
      let onboarding = defaultState.onboarding

      await Promise.all([
        loadLoginAttempt().then((data) => {
          if (data) {
            loginAttempt = data
          }
        }),
        loadState<PreferencesState>(LocalStorageKeys.Preferences, (val) => (preferences = val)),
        loadState<MigrationState>(LocalStorageKeys.Migration, (val) => (migration = val)),
        loadState<ToursState>(LocalStorageKeys.Tours, (val) => (tours = val)),
        loadState<StoreOnboardingState>(LocalStorageKeys.Onboarding, (val) => (onboarding = val)),
      ])

      const state: State = {
        ...defaultState,
        loginAttempt: { ...defaultState.loginAttempt, ...loginAttempt },
        preferences: { ...defaultState.preferences, ...preferences },
        migration: { ...defaultState.migration, ...migration },
        tours: { ...defaultState.tours, ...tours },
        onboarding: { ...defaultState.onboarding, ...onboarding },
      }
      dispatch({ type: DispatchAction.STATE_DISPATCH, payload: [state] })
    })

    return this
  }

  public resolve<K extends keyof TokenMapping>(token: K): TokenMapping[K] {
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
