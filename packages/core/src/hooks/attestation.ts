import { useCallback } from 'react'
import { Platform } from 'react-native'
import {
  attestKeyAsync,
  generateKeyAsync,
  generateHardwareAttestedKeyAsync,
  getAttestationCertificateChainAsync,
  isSupported as isAttestationSupportediOS,
  isHardwareAttestationSupportedAsync as isAttestationSupportedAndroid,
} from '@expo/app-integrity'
import uuid from 'react-native-uuid'
import { useAgent } from '@bifold/react-hooks'
import * as jose from 'jose'

import { PersistentStorage } from '../services/storage'
import { LocalStorageKeys } from '../constants'
import { useServices, TOKENS } from '../container-api'
import { useStore } from '../contexts/store'
import { DispatchAction } from '../contexts/reducers/store'
import { withRetry } from '../utils/network'
import type { GetAttestationJWTPayload } from '../types/attestation'

const WALLET_ATTEST_STORAGE_KEY = 'walletAttestStorage'

export const useAttestation = () => {

  const { agent } = useAgent()
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

  const storeAttestationJWT = useCallback(async (keyId: string, attestationJWT: string) => {
    agentBridge.onReady((initializedAgent) => {
      initializedAgent.genericRecords.save({
        content: {
          attestationKeyId: keyId,
          attestationJWT: attestationJWT,
        },
        id: WALLET_ATTEST_STORAGE_KEY,
      })
      .then(() => {
        PersistentStorage.storeValueForKey(LocalStorageKeys.AttestationConfigured, true)
          .then(() => {
            dispatch({ type: DispatchAction.SET_ATTESTATION_COMPLETED, payload: [true] })
          })
          .catch((err) => {
            logger.error(err?.message ?? 'Error storing attestation result status in async storage')
            throw new Error('Error storing attestation result status in async storage')
          })
      })
      .catch((err) => {
        logger.error(err?.message ?? 'Error storing attestation result in agent generic records')
        throw new Error('Error storing attestation result in agent generic records')
      })
    })
  }, [agentBridge, dispatch, logger])

  const retrieveAttestationJWT = useCallback(async (): Promise<string> => {
    try {

      const attestationKeyData = await agent.genericRecords.findById(WALLET_ATTEST_STORAGE_KEY)
      const keyId = attestationKeyData?.content?.["attestationKeyId"] as string ?? null
      const attestationJwt = attestationKeyData?.content?.["attestationJWT"] as string ?? null

      if (!keyId || !attestationJwt)
        throw new Error('No stored attestation data')

      return new Promise<string>(() => attestationJwt)

    } catch (err: any) {
      logger.error(err?.message ?? 'Error retrieving attestation JWT')
      throw new Error('Error retrieving attestation JWT')
    }
  }, [logger])

  const initAttestation = useCallback(async (): Promise<void> => {
    try {

      if (!enableAttestation) {
        dispatch({ type: DispatchAction.SET_ATTESTATION_COMPLETED, payload: [true] })
        return
      }

      const isAttestationConfigured = await PersistentStorage.fetchValueForKey(LocalStorageKeys.AttestationConfigured)

      if (isAttestationConfigured) {
        dispatch({ type: DispatchAction.SET_ATTESTATION_COMPLETED, payload: [true] })
        return
      }

      const { challenge } = await getAttestationChallenge()
      const secondaryKey = await agent.kms.createKeyForSignatureAlgorithm(
        { algorithm: 'ES256', backend: 'secureEnvironment' }
      )
      const secondaryKeyThumbprint = await jose.calculateJwkThumbprint(secondaryKey.publicJwk)

      if (Platform.OS === 'ios') {

        if (!isAttestationSupportediOS) throw new Error('iOS device not supported')

        const keyId = await generateKeyAsync()
        const attestationResult = await withRetry(attestKeyAsync, [keyId, challenge + secondaryKeyThumbprint])
        const getAttestationJwtPayload: GetAttestationJWTPayload = {
          challenge,
          keyId,
          attestationResult,
          secondaryKeyThumbprint
        }
        const attestationJWT = await getAttestationJWT(getAttestationJwtPayload)
        await storeAttestationJWT(keyId, attestationJWT.jwt)

      } else if (Platform.OS === 'android') {

        if (!isAttestationSupportedAndroid) throw new Error('Android device not supported')

        const keyId = uuid.v4().toString()
        await generateHardwareAttestedKeyAsync(keyId, challenge + secondaryKeyThumbprint)
        const attestationResult = await withRetry(getAttestationCertificateChainAsync, [keyId])
        const getAttestationJwtPayload: GetAttestationJWTPayload = {
          challenge,
          keyId,
          attestationResult,
          secondaryKeyThumbprint
        }
        const attestationJWT = await getAttestationJWT(getAttestationJwtPayload)
        await storeAttestationJWT(keyId, attestationJWT.jwt)

      } else throw new Error('Platform not supported')

    } catch(err: any) {
      logger.error(err?.message ?? 'Error initializing attestation')
      throw new Error('Error initializing attestation')
    }

  }, [enableAttestation, getAttestationChallenge, getAttestationJWT, dispatch, logger, storeAttestationJWT])

  return {
    initAttestation,
    retrieveAttestationJWT,
  }

}
