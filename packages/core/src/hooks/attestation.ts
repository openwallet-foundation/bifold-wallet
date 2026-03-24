import { useCallback } from 'react'
import { Platform } from 'react-native'
import {
  generateAssertionAsync,
  generateKeyAsync,
  prepareIntegrityTokenProviderAsync,
  requestIntegrityCheckAsync,
} from '@expo/app-integrity'
import { useAgent } from '@bifold/react-hooks'

import { PersistentStorage } from '../services/storage'
import { LocalStorageKeys } from '../constants'
import { useServices, TOKENS } from '../container-api'

export const useAttestation = () => {

  const [
    { attestation },
  ] = useServices([
    TOKENS.CONFIG,
  ])

  const { agent } = useAgent()

  const attestationSetup = useCallback(async (): Promise<void> => {
    try {

      if (!attestation?.enableAttestation) 
        throw new Error('Attestation not enabled')

      if (!agent)
        throw new Error('Agent unavailable')

      const attestationConfigured = await PersistentStorage.fetchValueForKey(LocalStorageKeys.AttestationConfigured)

      if (attestationConfigured)
        return

      const challenge = await attestation.getAttestationChallenge()

      if (Platform.OS === 'ios') {

        const keyId = await generateKeyAsync()
        const attestationResult = await generateAssertionAsync(keyId, challenge)
        const attestationJWT = await getAttesatationJWT(attestationResult, challenge)
        await storeAttestationJWT(attestationJWT, keyId)

      } else if (Platform.OS === 'android') {

        await prepareIntegrityTokenProviderAsync(attestation?.cloudProjectNumber)
        const attestationResult = await requestIntegrityCheckAsync(challenge)
        const attestationJWT = await getAttesatationJWT(attestationResult, challenge)
        await storeAttestationJWT(attestationJWT)

      } else throw new Error('Platform not supported')

    } catch(err) {
      console.log(err)
    }

  }, [attestation])

  const getAttesatationJWT = useCallback(async (attestationResult: string, challenge: string) => {
    try {

      if(!attestation?.applicationID) throw new Error('Missing Application ID')

      const payload = {
        attestation: attestationResult,
        bundleIdentifier: attestation?.applicationID,
        challenge,
        platform: Platform.OS,
      }
      const attestationJWT = await attestation?.getAttestationJWT(payload)

      return attestationJWT

    } catch (err) {
      throw new Error('Error getting attestation JWT from backend')
    }
  }, [attestation])

  const storeAttestationJWT = useCallback(async (attestationJWT: any, keyID?: string) => {
    try {

      await agent.genericRecords.save({
        content: {
          JWT: attestationJWT,
          keyID: keyID
        },
        id: 'AttestationJWT',
      })
      
      await PersistentStorage.storeValueForKey(LocalStorageKeys.AttestationConfigured, true)

    } catch (err) {
      throw new Error('Error storing attestation result')
    }
  }, [attestation])

  const retryAttestation = useCallback(() => {

  }, [])

  return {
    attestationSetup,
  }

}
