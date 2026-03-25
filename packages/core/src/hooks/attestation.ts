import { useCallback } from 'react'
import { Platform } from 'react-native'
import {
  attestKeyAsync,
  generateAssertionAsync,
  generateKeyAsync,
  generateHardwareAttestedKeyAsync,
  getAttestationCertificateChainAsync,
  isSupported as isDeviceAttestationSupported
} from '@expo/app-integrity'
import { useAgent } from '@bifold/react-hooks'

import { PersistentStorage } from '../services/storage'
import { LocalStorageKeys } from '../constants'
import { useServices, TOKENS } from '../container-api'

export const useAttestation = () => {

  const [
    getAttestationChallenge,
    getAttestationJWT,
    { enableAttestation },
  ] = useServices([
    TOKENS.FN_ATTESTATION_GET_CHALLENGE,
    TOKENS.FN_ATTESTATION_GET_JWT,
    TOKENS.CONFIG,
  ])

  const { agent } = useAgent()

  const attestationSetup = useCallback(async (): Promise<void> => {
    try {

      if (!enableAttestation || !getAttestationChallenge || !getAttestationJWT) 
        throw new Error('Attestation not configured')

      if (!agent)
        throw new Error('Agent unavailable')

      const attestationConfigured = await PersistentStorage.fetchValueForKey(LocalStorageKeys.AttestationConfigured)

      if (attestationConfigured)
        return

      const challenge = await getAttestationChallenge()

      if (Platform.OS === 'ios') {

        if (!isDeviceAttestationSupported) throw new Error('iOS device not supported')

        const keyID = await generateKeyAsync()
        const attestationResult = await generateAssertionAsync(keyID, challenge)
        const attestationJWT = await getAttestationJWT(attestationResult, challenge)
        await storeAttestationJWT(attestationJWT, keyID)

      } else if (Platform.OS === 'android') {

        const keyID = 'walletAttestationKey'
        await generateHardwareAttestedKeyAsync(keyID, challenge)
        const attestationResult = await getAttestationCertificateChainAsync(keyID)
        const attestationJWT = await getAttestationJWT(attestationResult, challenge)
        await storeAttestationJWT(attestationJWT, keyID)

      } else throw new Error('Platform not supported')

    } catch(err) {
      console.log(err)
    }

  }, [enableAttestation, getAttestationChallenge, getAttestationJWT])


  const storeAttestationJWT = useCallback(async (attestationJWT: any, keyID: string) => {
    try {

      await agent.genericRecords.save({
        content: attestationJWT,
        id: 'attestationJWT',
      })
      
      await PersistentStorage.storeValueForKey(LocalStorageKeys.AttestationConfigured, true)
      await PersistentStorage.storeValueForKey(LocalStorageKeys.AttestationKey, keyID)

    } catch (err) {
      throw new Error('Error storing attestation result')
    }
  }, [agent])

  return {
    attestationSetup,
  }

}
