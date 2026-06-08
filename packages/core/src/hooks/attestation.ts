import { useCallback, useState } from 'react'
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
import * as jose from 'jose'
import { CryptoDigestAlgorithm, digest } from 'expo-crypto'

import { PersistentStorage } from '../services/storage'
import { LocalStorageKeys } from '../constants'
import { useServices, TOKENS } from '../container-api'
import { useStore } from '../contexts/store'
import { DispatchAction } from '../contexts/reducers/store'
import { withRetry } from '../utils/network'
import type { GetAttestationJWTPayload } from '../types/attestation'
import { Agent, Kms } from '@credo-ts/core'

const WALLET_ATTEST_STORAGE_KEY = 'walletAttestStorage'

interface AttestationJwt {
  jwt: string,
  keyId: string,
  secondaryKeyId: string,
}

export const useAttestation = () => {

  const [, dispatch] = useStore()
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

  const storeAttestationJWT = useCallback(async (keyId: string, secondaryKeyId: string, attestationJWT: string, agent: Agent) => {
    try {

      await agent.genericRecords.save({
        content: {
          attestationKeyId: keyId,
          secondaryKeyId,
          attestationJWT: attestationJWT,
        },
        id: WALLET_ATTEST_STORAGE_KEY,
      })
      await PersistentStorage.storeValueForKey(LocalStorageKeys.AttestationConfigured, true)
      dispatch({ type: DispatchAction.SET_ATTESTATION_COMPLETED, payload: [true] })

    } catch (err: any) {
      logger.error(err?.message ?? 'Error storing attestation JWT')
      throw new Error('Error storing attestation JWT')
    }
    }, [agentBridge, dispatch, logger])

  const retrieveAttestationJWT = useCallback(async (agent: Agent): Promise<AttestationJwt> => {
    try {
      const attestationKeyData = await agent.genericRecords.findById(WALLET_ATTEST_STORAGE_KEY)
      const keyId = attestationKeyData?.content?.["attestationKeyId"] as string ?? null
      const jwt = attestationKeyData?.content?.["attestationJWT"] as string ?? null
      const secondaryKeyId = attestationKeyData?.content?.["secondaryKeyId"] as string ?? null

      if (!keyId || !jwt || !secondaryKeyId)
        throw new Error('No stored attestation data')

      const attestationJwt: AttestationJwt = {
        keyId,
        jwt,
        secondaryKeyId
      }

      return new Promise<AttestationJwt>(() => attestationJwt)

    } catch (err: any) {
      logger.error(err?.message ?? 'Error retrieving attestation JWT')
      throw new Error('Error retrieving attestation JWT')
    }
  }, [logger])

  // Helper function to base64url-encode a Uint8Array, used for JWT construction
  const b64url = useCallback((data: Uint8Array): string => {
    return btoa(String.fromCharCode(...data))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }, [])

  // Computes the bound challenge: base64url(SHA-256(challenge_utf8 || jwk_thumbprint)).
  const computeBoundChallenge = useCallback(async (challenge: string, thumbprint: string): Promise<string> => {
    const challengeBytes = new TextEncoder().encode(challenge)
    const thumbprintBytes = new TextEncoder().encode(thumbprint)
    const combined = new Uint8Array(challengeBytes.length + thumbprintBytes.length);
    combined.set(challengeBytes)
    combined.set(thumbprintBytes, challengeBytes.length)
    const hashBuffer = await digest(CryptoDigestAlgorithm.SHA256, combined);
    return b64url(new Uint8Array(hashBuffer));
  }, [])

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

      agentBridge.onReady(async (agent) => {
        const { challenge } = await getAttestationChallenge()
        const secondaryKey = await agent.kms.createKeyForSignatureAlgorithm(
          { algorithm: 'ES256', backend: 'secureEnvironment' }
        )
        const secondaryKeyThumbprint = await jose.calculateJwkThumbprint(secondaryKey.publicJwk)
        const signingKey = Kms.PublicJwk.fromPublicJwk(secondaryKey.publicJwk)
        const boundChallenge = await computeBoundChallenge(challenge, secondaryKeyThumbprint)

        if (Platform.OS === 'ios') {

          if (!isAttestationSupportediOS) throw new Error('iOS device not supported')

          const keyId = await generateKeyAsync()
          const attestationResult = await withRetry(attestKeyAsync, [keyId, boundChallenge])
          const getAttestationJwtPayload: GetAttestationJWTPayload = {
            challenge,
            keyId,
            attestationResult,
            signingKey,
          }
          const attestationJWT = await getAttestationJWT(getAttestationJwtPayload)
          await storeAttestationJWT(keyId, secondaryKey.keyId, attestationJWT.jwt, agent)

        } else if (Platform.OS === 'android') {

          if (!isAttestationSupportedAndroid) throw new Error('Android device not supported')

          const keyId = uuid.v4().toString()
          await generateHardwareAttestedKeyAsync(keyId, boundChallenge)
          const attestationResult = await withRetry(getAttestationCertificateChainAsync, [keyId])
          const getAttestationJwtPayload: GetAttestationJWTPayload = {
            challenge,
            keyId,
            attestationResult,
            signingKey,
          }
          const attestationJWT = await getAttestationJWT(getAttestationJwtPayload)
          await storeAttestationJWT(keyId, secondaryKey.keyId, attestationJWT.jwt, agent)

        } else throw new Error('Platform not supported')

      })

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
