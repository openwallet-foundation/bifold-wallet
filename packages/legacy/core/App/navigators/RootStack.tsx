import { ProofState } from '@credo-ts/core'
import { useAgent, useProofByState } from '@credo-ts/react-hooks'
import { ProofCustomMetadata, ProofMetadata } from '@hyperledger/aries-bifold-verifier'
import React, { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { DeviceEventEmitter } from 'react-native'

import { EventTypes } from '../constants'
import { TOKENS, useServices } from '../container-api'
import { useStore } from '../contexts/store'
import { useDeepLinks } from '../hooks/deep-links'
import { BifoldError } from '../types/error'
import MainStack from './MainStack'

const RootStack: React.FC = () => {
  const [store, dispatch] = useStore()
  const { agent } = useAgent()
  const { t } = useTranslation()
  const [OnboardingStack, loadState] = useServices([TOKENS.STACK_ONBOARDING, TOKENS.LOAD_STATE])
  // remove connection on mobile verifier proofs if proof is rejected
  // regardless of if it has been opened
  const declinedProofs = useProofByState([ProofState.Declined, ProofState.Abandoned])

  useDeepLinks()

  const isAuthenticated = useMemo(
    () => store.authentication.didAuthenticate && store.onboarding.postAuthScreens.length === 0,
    [store.authentication.didAuthenticate, store.onboarding.postAuthScreens]
  )

  const isOnboardingComplete = useMemo(
    () =>
      (store.onboarding.onboardingVersion !== 0 && store.onboarding.didCompleteOnboarding) ||
      (store.onboarding.onboardingVersion === 0 && store.onboarding.didConsiderBiometry),
    [store.onboarding.onboardingVersion, store.onboarding.didCompleteOnboarding, store.onboarding.didConsiderBiometry]
  )

  useEffect(() => {
    declinedProofs.forEach((proof) => {
      const meta = proof?.metadata?.get(ProofMetadata.customMetadata) as ProofCustomMetadata
      if (meta?.delete_conn_after_seen) {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        agent?.connections.deleteById(proof?.connectionId ?? '').catch(() => {})
        proof?.metadata.set(ProofMetadata.customMetadata, { ...meta, delete_conn_after_seen: false })
      }
    })
  }, [declinedProofs, agent, store.preferences.useDataRetention])

  useEffect(() => {
    loadState(dispatch).catch((err: unknown) => {
      const error = new BifoldError(t('Error.Title1044'), t('Error.Message1044'), (err as Error).message, 1001)
      DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
    })
  }, [dispatch, loadState, t])

  if (isOnboardingComplete && isAuthenticated) {
    return <MainStack />
  }

  return <OnboardingStack />
}

export default RootStack
