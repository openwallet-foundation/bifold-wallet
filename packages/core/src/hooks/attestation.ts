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
  const [{
    attestation
  }] = useServices([
    TOKENS.CONFIG
  ])

  const fetchAttestationChallenge = useCallback(async (): Promise<string | void> => {
    try {

    if(attestation?.enableAttestation)
      throw new Error('Attestation not enabled')
    
    const challengeResponse = await fetch(attestation?.challengeURL as string)
    if (!challengeResponse.ok) {
      throw new Error(`Failed to fetch challenge: ${challengeResponse.status}`);
    }
    const { challenge } = await challengeResponse.json();

    return challenge

    } catch (err) {
      console.log(err)
    }

  }, [attestation?.challengeURL, attestation?.enableAttestation])

  const attestationSetup = useCallback(async (): Promise<void> => {
    try {

      if (!attestation?.enableAttestation) 
        throw new Error('Attestation not enabled')
      
      const attestKey = await PersistentStorage.fetchValueForKey(LocalStorageKeys.Attestation)
      if (attestKey)
        throw new Error('Attestation already configured')
      if (Platform.OS === 'ios') {
        const keyID = await generateKeyAsync()
        const challenge = await fetchAttestationChallenge()
        attestKeyAsync(keyID, challenge as string)
          .then(async (res: string) => {
            await PersistentStorage.storeValueForKey(LocalStorageKeys.Attestation, keyID)
            return res
          })
          .catch((err: any) => {
            throw new Error(err)
          })
      }
      else if (Platform.OS === 'android') {
        prepareIntegrityTokenProviderAsync(attestation?.cloudProjectNumber)
          .then(async (res) => {
            await PersistentStorage.storeValueForKey(LocalStorageKeys.Attestation, '')
            return res
          })
          .catch((err) => {
            throw new Error(err)
          })
      }
      else throw new Error('Platform not supported')

    } catch(err) {
      console.log(err)
    }

  }, [attestation?.enableAttestation, attestation?.cloudProjectNumber])

  const attestChallenge = useCallback(async () => {
    try {

      if (!attestation?.enableAttestation) 
        throw new Error('Attestation not enabled')

      const challenge = await fetchAttestationChallenge()

      if (Platform.OS === 'ios') {
        const key = await PersistentStorage.fetchValueForKey(LocalStorageKeys.Attestation) as string
        const result = await generateAssertionAsync(key, challenge as string)
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

  }, [attestation?.enableAttestation, fetchAttestationChallenge])

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
