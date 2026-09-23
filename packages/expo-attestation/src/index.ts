import { Platform } from 'react-native'
import {
  attestKeyAsync,
  generateKeyAsync,
  generateHardwareAttestedKeyAsync,
  getAttestationCertificateChainAsync,
  isSupported as isAppAttestSupported,
  isHardwareAttestationSupportedAsync,
} from '@expo/app-integrity'
import { CryptoDigestAlgorithm, digestStringAsync } from 'expo-crypto'
import uuid from 'react-native-uuid'

/**
 * Mirrors AttestationProvider / AttestationResult from @bifold/core. Declared
 * locally so this package does not depend on @bifold/core, which would be circular.
 */
export type AttestationResult =
  | { kind: 'apple-app-attest'; keyId: string; attestation: string }
  | { kind: 'android-key-attestation'; keyId: string; certificateChain: string[] }

/** The mechanism that produced an AttestationResult. */
export type AttestationKind = AttestationResult['kind']

export interface AttestationProvider {
  isSupported(): Promise<boolean>
  attest(challenge: string): Promise<AttestationResult>
}

/**
 * Attestation backed by `@expo/app-integrity`: Apple App Attest on iOS and Android
 * hardware key attestation on Android.
 *
 * The Android path yields an X.509 certificate chain rather than an opaque blob, so a
 * verifier must branch on `kind`.
 */
export const expoAttestationProvider: AttestationProvider = {
  isSupported: async (): Promise<boolean> => {
    if (Platform.OS === 'ios') {
      // `isSupported` is a boolean, not a function.
      return isAppAttestSupported
    }
    if (Platform.OS === 'android') {
      return await isHardwareAttestationSupportedAsync()
    }
    return false
  },

  attest: async (challenge: string): Promise<AttestationResult> => {
    if (Platform.OS === 'ios') {
      const keyId = await generateKeyAsync()
      // iOS hashes the challenge inside the OS, so it is passed through unmodified.
      const attestation = await attestKeyAsync(keyId, challenge)
      return { kind: 'apple-app-attest', keyId, attestation }
    }

    if (Platform.OS === 'android') {
      const keyId = uuid.v4().toString()
      // Keep the challenge under the 128 byte limit and consistent with iOS,
      // where the OS hashes it for us.
      const boundChallenge = await digestStringAsync(CryptoDigestAlgorithm.SHA256, challenge)
      await generateHardwareAttestedKeyAsync(keyId, boundChallenge)
      const certificateChain = await getAttestationCertificateChainAsync(keyId)
      return { kind: 'android-key-attestation', keyId, certificateChain }
    }

    throw new Error(`Attestation is not supported on ${Platform.OS}`)
  },
}
