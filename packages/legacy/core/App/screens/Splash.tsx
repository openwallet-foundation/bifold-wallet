import { Agent, ConsoleLogger, HttpOutboundTransport, LogLevel, WsOutboundTransport } from '@aries-framework/core'
import { IndySdkToAskarMigrationUpdater } from '@aries-framework/indy-sdk-to-askar-migration'
import { useAgent } from '@aries-framework/react-hooks'
import { agentDependencies } from '@aries-framework/react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation } from '@react-navigation/core'
import { CommonActions } from '@react-navigation/native'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, StyleSheet } from 'react-native'
import { Config } from 'react-native-config'
import * as RNFS from 'react-native-fs'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

import LoadingIndicator from '../components/animated/LoadingIndicator'
import { ToastType } from '../components/toast/BaseToast'
import { LocalStorageKeys } from '../constants'
import { useAuth } from '../contexts/auth'
import { useConfiguration } from '../contexts/configuration'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { Screens, Stacks } from '../types/navigators'
import {
  Onboarding as StoreOnboardingState,
  Preferences as PreferencesState,
  LoginAttempt as LoginAttemptState,
  Migration as MigrationState,
} from '../types/state'
import { getAgentModules } from '../utils/agent'

const onboardingComplete = (state: StoreOnboardingState): boolean => {
  return state.didCompleteTutorial && state.didAgreeToTerms && state.didCreatePIN && state.didConsiderBiometry
}

const didMigrateToAskar = (state: MigrationState) => state.didMigrateToAskar

const resumeOnboardingAt = (state: StoreOnboardingState): Screens => {
  if (state.didCompleteTutorial && state.didAgreeToTerms && state.didCreatePIN && !state.didConsiderBiometry) {
    return Screens.UseBiometry
  }

  if (state.didCompleteTutorial && state.didAgreeToTerms && !state.didCreatePIN) {
    return Screens.CreatePIN
  }

  if (state.didCompleteTutorial && !state.didAgreeToTerms) {
    return Screens.Terms
  }

  return Screens.Onboarding
}

/**
 * To customize this splash screen set the background color of the
 * iOS and Android launch screen to match the background color of
 * of this view.
 */
const Splash: React.FC = () => {
  const { indyLedgers } = useConfiguration()
  const { setAgent } = useAgent()
  const { t } = useTranslation()
  const [store, dispatch] = useStore()
  const navigation = useNavigation()
  const { getWalletCredentials } = useAuth()
  const { ColorPallet } = useTheme()
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: ColorPallet.brand.primaryBackground,
    },
  })

  const loadAuthAttempts = async (): Promise<LoginAttemptState | undefined> => {
    try {
      const attemptsData = await AsyncStorage.getItem(LocalStorageKeys.LoginAttempts)
      if (attemptsData) {
        const attempts = JSON.parse(attemptsData) as LoginAttemptState
        dispatch({
          type: DispatchAction.ATTEMPT_UPDATED,
          payload: [attempts],
        })
        return attempts
      }
    } catch (error) {
      // todo (WK)
    }
  }

  useEffect(() => {
    if (store.authentication.didAuthenticate) {
      return
    }

    const initOnboarding = async (): Promise<void> => {
      try {
        // load authentication attempts from storage
        const attemptData = await loadAuthAttempts()

        const preferencesData = await AsyncStorage.getItem(LocalStorageKeys.Preferences)
        if (preferencesData) {
          const dataAsJSON = JSON.parse(preferencesData) as PreferencesState

          dispatch({
            type: DispatchAction.PREFERENCES_UPDATED,
            payload: [dataAsJSON],
          })
        }

        const migrationData = await AsyncStorage.getItem(LocalStorageKeys.Migration)
        if (migrationData) {
          const dataAsJSON = JSON.parse(migrationData) as MigrationState

          dispatch({
            type: DispatchAction.MIGRATION_UPDATED,
            payload: [dataAsJSON],
          })
        }

        const data = await AsyncStorage.getItem(LocalStorageKeys.Onboarding)
        if (data) {
          const onboardingState = JSON.parse(data) as StoreOnboardingState
          dispatch({ type: DispatchAction.ONBOARDING_UPDATED, payload: [onboardingState] })
          if (onboardingComplete(onboardingState) && !attemptData?.lockoutDate) {
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: Screens.EnterPIN }],
              })
            )
            return
          } else if (onboardingComplete(onboardingState) && attemptData?.lockoutDate) {
            // return to lockout screen if lockout date is set
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: Screens.AttemptLockout }],
              })
            )
            return
          } else {
            // If onboarding was interrupted we need to pickup from where we left off.
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: resumeOnboardingAt(onboardingState) }],
              })
            )
          }
          return
        }
        // We have no onboarding state, starting from step zero.
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: Screens.Onboarding }],
          })
        )
      } catch (error) {
        // TODO:(am add error handling here)
      }
    }

    initOnboarding()
  }, [store.authentication.didAuthenticate])

  useEffect(() => {
    if (!store.authentication.didAuthenticate || !store.onboarding.didConsiderBiometry) {
      return
    }

    const initAgent = async (): Promise<void> => {
      try {
        const credentials = await getWalletCredentials()

        if (!credentials?.id || !credentials.key) {
          // Cannot find wallet id/secret
          return
        }

        const newAgent = new Agent({
          config: {
            label: 'Aries Bifold',
            walletConfig: { id: credentials.id, key: credentials.key },
            logger: new ConsoleLogger(LogLevel.trace),
            autoUpdateStorageOnStartup: true,
          },
          dependencies: agentDependencies,
          modules: getAgentModules({
            indyNetworks: indyLedgers,
            mediatorInvitationUrl: Config.MEDIATOR_URL,
          }),
        })
        const wsTransport = new WsOutboundTransport()
        const httpTransport = new HttpOutboundTransport()

        newAgent.registerOutboundTransport(wsTransport)
        newAgent.registerOutboundTransport(httpTransport)

        // If we haven't migrated to Aries Askar yet, we need to do this before we initialize the agent.
        if (!didMigrateToAskar(store.migration)) {
          newAgent.config.logger.debug('Agent not updated to Aries Askar, updating...')
          const base = Platform.OS === 'ios' ? RNFS.DocumentDirectoryPath : RNFS.ExternalDirectoryPath
          const dbPath = `${base}/.indy_client/wallet/${credentials.id}/sqlite.db`
          const updater = await IndySdkToAskarMigrationUpdater.initialize({
            dbPath,
            agent: newAgent,
            // We want to keep the backup file in case anything goes wrong. this will allow us to release patches and still update the original indy-sdk
            // in a future version we could manually add a check to remove the old file from storage.
            deleteOnFinish: false,
          })
          await updater.update()

          newAgent.config.logger.debug('Succesfully finished updating agent to Aries Askar')
          // Store that we migrated to askar.
          dispatch({
            type: DispatchAction.DID_MIGRATE_TO_ASKAR,
          })
        }

        await newAgent.initialize()

        // If we don't have any link secrets yet, we will create a default link secret that will be used
        // for all anoncreds credential requests.
        const linkSecretIds = await newAgent.modules.anoncreds.getLinkSecretIds()
        if (linkSecretIds.length === 0) {
          await newAgent.modules.anoncreds.createLinkSecret({
            setAsDefault: true,
          })
        }

        setAgent(newAgent)
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: Stacks.TabStack }],
          })
        )
      } catch (e: unknown) {
        Toast.show({
          type: ToastType.Error,
          text1: t('Global.Failure'),
          text2: (e as Error)?.message || t('Error.Unknown'),
          visibilityTime: 2000,
          position: 'bottom',
        })
        return
      }
    }

    initAgent()
  }, [store.authentication.didAuthenticate, store.onboarding.didConsiderBiometry])

  return (
    <SafeAreaView style={styles.container}>
      <LoadingIndicator />
    </SafeAreaView>
  )
}

export default Splash
