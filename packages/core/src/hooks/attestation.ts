import { useCallback } from 'react'
import { Platform } from 'react-native'
import {
  attestKeyAsync,
  generateKeyAsync,
  generateHardwareAttestedKeyAsync,
  getAttestationCertificateChainAsync,
  isSupported as isDeviceAttestationSupported,
} from '@expo/app-integrity'
import uuid from 'react-native-uuid'
import { useAgent } from '@bifold/react-hooks'
import { Kms } from '@credo-ts/core'

import { PersistentStorage } from '../services/storage'
import { LocalStorageKeys } from '../constants'
import { useServices, TOKENS } from '../container-api'
import { useStore } from '../contexts/store'
import { DispatchAction } from '../contexts/reducers/store'
import { withRetry } from '../utils/network'

export interface AttestationJWTData {
  jwt: string,
  transactionId: string,
}

const ATTESTATION_JWT_RECORD_ID = 'attestationJWT'

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

  const storeAttestationJWT = useCallback(async (attestationJWT: string, keyID: string) => {
    agentBridge.onReady((initializedAgent) => {
      initializedAgent.genericRecords.save({
        content: {
          attestationJWT: attestationJWT,
          attestationKeyID: keyID,
        },
        id: ATTESTATION_JWT_RECORD_ID,
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

  const retrieveAttestationJWT = useCallback(async (): Promise<AttestationJWTData> => {
    try {

      const storedAttestationData = await agent.genericRecords.findById(ATTESTATION_JWT_RECORD_ID)

      if (!storedAttestationData?.content)
        throw new Error('No stored attestation data')

      const JWT = {
        jwt: storedAttestationData.content["jwt"] as string,
        transactionId: storedAttestationData.content["transactionId"] as string
      }
      return new Promise<AttestationJWTData>(() => JWT)

    } catch (err: any) {
      logger.error(err?.message ?? 'Error retrieving attestation JWT')
      throw new Error('Error retrieving attestation JWT')
    }
  }, [logger])

  const setupAttestation = useCallback(async (): Promise<void> => {
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

      const challenge = await getAttestationChallenge()

      if (Platform.OS === 'ios') {

        if (!isDeviceAttestationSupported) throw new Error('iOS device not supported')

        const keyID = await generateKeyAsync()
        const secondaryKey = await agent.kms.createKeyForSignatureAlgorithm({
          algorithm: 'EdDSA',
          keyId: keyID,
        })
        const publicKey = Kms.PublicJwk.fromPublicJwk(secondaryKey.publicJwk)
        const attestationResult = await withRetry(attestKeyAsync, [keyID, (challenge+publicKey)])
        const attestationJWT = await getAttestationJWT(attestationResult, challenge, keyID)
        await storeAttestationJWT(attestationJWT.jwt, keyID)

      } else if (Platform.OS === 'android') {

        const keyID = uuid.v4().toString()
        await generateHardwareAttestedKeyAsync(keyID, challenge)
        const attestationResult = await withRetry(getAttestationCertificateChainAsync, [keyID])
        const attestationJWT = await getAttestationJWT(attestationResult, challenge, keyID)
        await storeAttestationJWT(attestationJWT.jwt, keyID)

      } else throw new Error('Platform not supported')

    } catch(err: any) {
      logger.error(err?.message ?? 'Error initializing attestation')
      throw new Error('Error initializing attestation')
    }

  }, [enableAttestation, getAttestationChallenge, getAttestationJWT, dispatch, logger, storeAttestationJWT])

  return {
    setupAttestation,
    retrieveAttestationJWT,
  }

}
