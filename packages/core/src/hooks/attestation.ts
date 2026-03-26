import { useCallback, useEffect } from 'react'
import { Platform, DeviceEventEmitter } from 'react-native'
import {
  attestKeyAsync,
  generateKeyAsync,
  generateHardwareAttestedKeyAsync,
  getAttestationCertificateChainAsync,
  isSupported as isDeviceAttestationSupported,
} from '@expo/app-integrity'
import { useTranslation } from 'react-i18next'

import { PersistentStorage } from '../services/storage'
import { LocalStorageKeys } from '../constants'
import { useServices, TOKENS } from '../container-api'
import { BifoldError } from '../types/error'
import { EventTypes } from '../constants'
import { useStore } from '../contexts/store'
import { DispatchAction } from '../contexts/reducers/store'

export const useAttestation = () => {

  const [
    getAttestationChallenge,
    getAttestationJWT,
    { enableAttestation },
    logger,
    agentBridge,
  ] = useServices([
    TOKENS.FN_ATTESTATION_GET_CHALLENGE,
    TOKENS.FN_ATTESTATION_GET_JWT,
    TOKENS.CONFIG,
    TOKENS.UTIL_LOGGER,
    TOKENS.UTIL_AGENT_BRIDGE,
  ])
  const [, dispatch] = useStore()
  const { t } = useTranslation()

  const storeAttestationJWT = useCallback(async (attestationJWT: any, keyID: string) => {
    try {
      agentBridge.onReady(async (agent) => {
        await agent.genericRecords.save({
          content: attestationJWT,
          id: 'attestationJWT',
        })
        await PersistentStorage.storeValueForKey(LocalStorageKeys.AttestationConfigured, true)
        await PersistentStorage.storeValueForKey(LocalStorageKeys.AttestationKey, keyID)
        dispatch({ type: DispatchAction.SET_ATTESTATION_COMPLETED, payload: [true] })
      })
    } catch (err) {
      throw new Error('Error storing attestation result')
    }
  }, [agentBridge])

  const setupAttestation = useCallback(async (): Promise<void> => {
    try {

      if (!enableAttestation || !getAttestationChallenge || !getAttestationJWT) {
        dispatch({ type: DispatchAction.SET_ATTESTATION_COMPLETED, payload: [true] })
        return
      }

      const isAttestationConfigured = await PersistentStorage.fetchValueForKey(LocalStorageKeys.AttestationConfigured)

      if (isAttestationConfigured) {
        dispatch({ type: DispatchAction.SET_ATTESTATION_COMPLETED, payload: [true] })
        return
      }

      const challenge = await getAttestationChallenge()

      if (Platform.OS === 'ios') {

        if (!isDeviceAttestationSupported) throw new Error('iOS device not supported')

        const keyID = await generateKeyAsync()
        const attestationResult = await attestKeyAsync(keyID, challenge)
        const attestationJWT = await getAttestationJWT(attestationResult, challenge, keyID)
        await storeAttestationJWT(attestationJWT, keyID)

      } else if (Platform.OS === 'android') {

        const keyID = 'walletAttestationKey'
        await generateHardwareAttestedKeyAsync(keyID, challenge)
        const attestationResult = await getAttestationCertificateChainAsync(keyID)
        const attestationJWT = await getAttestationJWT(attestationResult, challenge, keyID)
        await storeAttestationJWT(attestationJWT, keyID)

      } else throw new Error('Platform not supported')

    } catch(err) {
      dispatch({ type: DispatchAction.SET_ATTESTATION_COMPLETED, payload: [false] })
      throw new Error('Error initializing attestation')
    }

  }, [enableAttestation, getAttestationChallenge, getAttestationJWT])

  return {
    setupAttestation,
  }

}
