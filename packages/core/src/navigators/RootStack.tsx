import AgentProvider from '@credo-ts/react-hooks'
import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { DeviceEventEmitter } from 'react-native'

import { OpenIDCredentialRecordProvider } from '../modules/openid/context/OpenIDCredentialRecordProvider'
import { EventTypes } from '../constants'
import { TOKENS, useServices } from '../container-api'
import { ActivityProvider } from '../contexts/activity'
import { useStore } from '../contexts/store'
import { BifoldError } from '../types/error'
import { RootStackParams, Screens } from '../types/navigators'
import { useMigrationPrompt } from '../hooks/useMigrationPrompt'
import { useNavigationRef } from '../contexts/navigation'
import MigrationPrompt from '../components/MigrationPrompt'
import MainStack from './MainStack'

const RootStack: React.FC = () => {
  const [store, dispatch] = useStore()
  const { t } = useTranslation()
  const [useAgentSetup, OnboardingStack, loadState] = useServices([
    TOKENS.HOOK_USE_AGENT_SETUP,
    TOKENS.STACK_ONBOARDING,
    TOKENS.LOAD_STATE,
  ])
  const { agent, initializeAgent, shutdownAndClearAgentIfExists } = useAgentSetup()
  const [onboardingComplete, setOnboardingComplete] = useState(false)
  const navigationRef = useNavigationRef()

  const shouldRenderMainStack = useMemo(
    () => onboardingComplete && store.authentication.didAuthenticate,
    [onboardingComplete, store.authentication.didAuthenticate]
  )

  // Migration prompt hook
  const {
    showPrompt: showMigrationPrompt,
    postponeCount,
    daysRemaining,
    deadlinePassed,
    handleAccept: handleMigrationAccept,
    handlePostpone: handleMigrationPostpone,
  } = useMigrationPrompt(() => {
    // Navigate to MigrationFlowScreen when user accepts migration
    if (navigationRef?.current) {
      navigationRef.current.navigate(Screens.MigrationFlow)
    }
  })

  useEffect(() => {
    // if user gets locked out, erase agent
    if (!store.authentication.didAuthenticate) {
      shutdownAndClearAgentIfExists()
    }
  }, [store.authentication.didAuthenticate, shutdownAndClearAgentIfExists])

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(EventTypes.DID_COMPLETE_ONBOARDING, () => {
      setOnboardingComplete(true)
    })

    return sub.remove
  }, [])

  useEffect(() => {
    // Load state only if it hasn't been loaded yet
    if (store.stateLoaded) return

    loadState(dispatch).catch((err: unknown) => {
      const error = new BifoldError(t('Error.Title1044'), t('Error.Message1044'), (err as Error).message, 1001)

      DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
    })
  }, [dispatch, loadState, t, store.stateLoaded])

  if (shouldRenderMainStack && agent) {
    return (
      <>
        <AgentProvider agent={agent}>
          <OpenIDCredentialRecordProvider>
            <ActivityProvider>
              <MainStack />
            </ActivityProvider>
          </OpenIDCredentialRecordProvider>
        </AgentProvider>
        
        {/* Migration prompt - shown after authentication */}
        {showMigrationPrompt && (
          <MigrationPrompt
            visible={showMigrationPrompt}
            postponeCount={postponeCount}
            daysRemaining={daysRemaining}
            deadlinePassed={deadlinePassed}
            onAccept={handleMigrationAccept}
            onPostpone={handleMigrationPostpone}
          />
        )}
      </>
    )
  }

  return <OnboardingStack agent={agent} initializeAgent={initializeAgent} />
}

export default RootStack
