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
import { GetAttestationJWTPayload } from 'types/attestation'

const WALLET_ATTEST_STORAGE_KEY = 'walletAttestStorage'

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

  const storeAttestationJWT = useCallback(async (attestationJwt: string, agent: Agent): Promise<void> => {
    try {
      await agent.genericRecords.save({
        content: {
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

  const retrieveAttestationJWT = useCallback(async (agent: Agent): Promise<string> => {
    try {

      const storedAttestationData = await agent.genericRecords.findById(WALLET_ATTEST_STORAGE_KEY)
      const attestationJwt = storedAttestationData?.content?.["attestationJwt"] as string ?? null

      if (attestationJwt)
        throw new Error('No stored attestation data')

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

      await agentBridge.onReady(async (agent) => {

        const challenge = await getAttestationChallenge()
        const secondaryKey = await agent.kms.createKeyForSignatureAlgorithm(
          { algorithm: 'ES256', backend: 'secureEnvironment' }
        )
        const signingKey = Kms.PublicJwk.fromPublicJwk(secondaryKey.publicJwk)
        const thumbprint = encodeToBase64Url(signingKey.getJwkThumbprint())

        if (Platform.OS === 'ios') {

          if (!isAttestationSupportediOS) throw new Error('iOS device not supported')

          const keyId = await generateKeyAsync()
          // No need to SHA256 encode the challenge on iOS as that is handled by the OS
          const attestationResult = await withRetry(attestKeyAsync, [keyId, challenge + thumbprint])
          const getAttestationJwtParams: GetAttestationJWTPayload = {
            attestationResult,
            challenge,
            keyId,
            signingKey,
          }
          const attestationJWT = await getAttestationJWT(getAttestationJwtParams)
          await storeAttestationJWT(attestationJWT?.signedAttestation, agent)

        } else if (Platform.OS === 'android') {

          if (!isAttestationSupportedAndroid) throw new Error('Android device not supported')

          const keyId = uuid.v4().toString()
          // To ensure that the string is kept at a reasonable size (< 128 bytes) and consistency with the native iOS implementation
          const boundChallenge = await digestStringAsync(CryptoDigestAlgorithm.SHA256, challenge + thumbprint)
          await generateHardwareAttestedKeyAsync(keyId, boundChallenge)
          const attestationResult = await withRetry(getAttestationCertificateChainAsync, [keyId])
          const getAttestationJwtParams: GetAttestationJWTPayload = {
            attestationResult,
            challenge,
            keyId,
            signingKey,
          }
          const attestationJWT = await getAttestationJWT(getAttestationJwtParams)
          await storeAttestationJWT(attestationJWT?.signedAttestation, agent)

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
    storeAttestationJWT,
  }

}
