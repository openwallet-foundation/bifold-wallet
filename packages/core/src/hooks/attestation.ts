import { useCallback } from 'react'
import { Platform } from 'react-native'
import {
  attestKeyAsync,
  generateAssertionAsync,
  generateKeyAsync,
  prepareIntegrityTokenProviderAsync,
  requestIntegrityCheckAsync,
} from '@expo/app-integrity'

import { PersistentStorage } from '../services/storage'
import { LocalStorageKeys } from '../constants'
import { useServices, TOKENS } from '../container-api'

export const useAttestation = () => {
  const [
    { attestation }
  ] = useServices([
    TOKENS.CONFIG
  ])

  const attestationSetup = useCallback(async (): Promise<void> => {
    try {
      if (!attestation?.enableAttestation) 
        throw new Error('Attestation not enabled')

      const attestationConfigured = await PersistentStorage.fetchValueForKey(LocalStorageKeys.AttestationConfigured)

      if (attestationConfigured)
        throw new Error('Attestation already configured')

      const challenge = await attestation.getAttestationChallenge()

      if (Platform.OS === 'ios') {

        const keyId = await generateKeyAsync()
        const attestationResult = await attestKeyAsync(keyId, challenge)
        const payload = {
          keyId,
          attestation: attestationResult,
          bundleIdentifier: attestation?.applicationID,
          challenge,
          platform: Platform.OS,
        }

        const attestationJWT = await attestation?.getAttestationJWT(payload)

      }
      else if (Platform.OS === 'android') {
        await prepareIntegrityTokenProviderAsync(attestation?.cloudProjectNumber)
        const attestationResult = await requestIntegrityCheckAsync(challenge)
        const payload = {
          attestation: attestationResult,
          bundleIdentifier: attestation?.applicationID,
          challenge,
          platform: Platform.OS,
        }
      const attestationJWT = await attestation?.getAttestationJWT(payload)
      }
      else throw new Error('Platform not supported')
    } catch(err) {
      console.log(err)
    }

  }, [attestation?.enableAttestation, attestation?.cloudProjectNumber, attestation?.getAttestationChallenge])

  const attestChallenge = useCallback(async () => {
    try {

      if (!attestation?.enableAttestation) 
        throw new Error('Attestation not enabled')

      const challenge = await attestation.getAttestationChallenge()

      if (Platform.OS === 'ios') {
        const keyID = await PersistentStorage.fetchValueForKey(LocalStorageKeys.Attestation) as string
        const result = await generateAssertionAsync(keyID, challenge as string)
        return { result, challenge }
      }
      else if (Platform.OS === 'android') {
        const result = await requestIntegrityCheckAsync(challenge as string)
        return { result, challenge }
      }
      else throw new Error('Platform not supported')

    } catch (err) {
      console.log(err)
    }

  }, [attestation?.enableAttestation, attestation?.getAttestationChallenge])

  const confirmAttestationChallenge = useCallback(async () => {
    try {

      if(!attestation?.enableAttestation)
        throw new Error('Attestation not enabled')

      const attestChallengeResult = await attestChallenge()

      const payload: any = {
        attestation: attestChallengeResult?.result,
        bundleIdentifier: attestation?.applicationID,
        challenge: attestChallengeResult?.challenge,
        platform: Platform.OS,
      }

      const confirmationResponse = await fetch(attestation?.registerAttestationURL as string, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if(!confirmationResponse.ok) {
        throw new Error(`Failed to fetch challenge: ${confirmationResponse.status}`);
      }
      
      return confirmationResponse

    } catch(err) {
      console.log(err)
    }

  }, [attestChallenge, attestation?.applicationID, attestation?.enableAttestation, attestation?.registerAttestationURL])

  return {
    confirmAttestationChallenge,
    attestationSetup,
  }

}
