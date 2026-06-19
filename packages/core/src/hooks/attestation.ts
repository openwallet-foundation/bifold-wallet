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
import { CryptoDigestAlgorithm, digestStringAsync } from 'expo-crypto'

import { PersistentStorage } from '../services/storage'
import { LocalStorageKeys } from '../constants'
import { useServices, TOKENS } from '../container-api'
import { useStore } from '../contexts/store'
import { DispatchAction } from '../contexts/reducers/store'
import { withRetry } from '../utils/network'
import { Agent, Kms } from '@credo-ts/core'
import { encodeToBase64Url } from '@openid4vc/utils'

const WALLET_ATTEST_STORAGE_KEY = 'walletAttestStorage'

interface AttestationJwt {
  jwt: string,
  keyId: string,
  signingKeyId: string,
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

  const storeAttestationJWT = useCallback(async (attestationKeyId: string, signingKeyId: string, attestationJwt: string, agent: Agent): Promise<void> => {
    try {

      await agent.genericRecords.save({
        content: {
          attestationKeyId,
          signingKeyId,
          attestationJwt,
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
      const jwt = attestationKeyData?.content?.["attestationJwt"] as string ?? null
      const signingKeyId = attestationKeyData?.content?.["signingKeyId"] as string ?? null

      if (!keyId || !jwt || !signingKeyId)
        throw new Error('No stored attestation data')

      const attestationJwt: AttestationJwt = {
        keyId,
        jwt,
        signingKeyId
      }

      return attestationJwt

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

      agentBridge.onReady(async (agent) => {

        const challenge = await getAttestationChallenge()
        const secondaryKey = await agent.kms.createKeyForSignatureAlgorithm(
          { algorithm: 'ES256', backend: 'secureEnvironment' }
        )
        const signingKey = Kms.PublicJwk.fromPublicJwk(secondaryKey.publicJwk)

        console.log(signingKey)
        const thumbprint = encodeToBase64Url(signingKey.getJwkThumbprint())
        console.log(thumbprint)

        if (Platform.OS === 'ios') {

          if (!isAttestationSupportediOS) throw new Error('iOS device not supported')

          const keyId = await generateKeyAsync()
          // No need to SHA256 encode the challenge on iOS as that is handled by the OS
          const attestationResult = await withRetry(attestKeyAsync, [keyId, challenge + thumbprint])
          const attestationJWT = await getAttestationJWT(attestationResult, challenge, keyId, signingKey)
          await storeAttestationJWT(keyId, signingKey.keyId, attestationJWT?.signedAttestation, agent)

        } else if (Platform.OS === 'android') {

          if (!isAttestationSupportedAndroid) throw new Error('Android device not supported')

          const keyId = uuid.v4().toString()
          // To ensure that the string is kept at a reasonable size (< 128 bytes) and consistency with the native iOS implementation
          const boundChallenge = await digestStringAsync(CryptoDigestAlgorithm.SHA256, challenge + thumbprint)
          await generateHardwareAttestedKeyAsync(keyId, boundChallenge)
          const attestationResult = await withRetry(getAttestationCertificateChainAsync, [keyId])
          const attestationJWT = await getAttestationJWT(attestationResult, challenge, keyId, signingKey)
          await storeAttestationJWT(keyId, signingKey.keyId, attestationJWT?.signedAttestation, agent)

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
