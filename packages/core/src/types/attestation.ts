import { Agent, Kms } from '@credo-ts/core'

export const AttestationEventTypes = {
  Started: 'AttestationEvent.Started',
  Completed: 'AttestationEvent.Completed',
  FailedHandleOffer: 'AttestationEvent.FailedHandleOffer',
  FailedHandleProof: 'AttestationEvent.FailedHandleProof',
  FailedRequestCredential: 'AttestationEvent.FailedRequestCredential',
} as const

export interface AttestationMonitor {
  readonly attestationWorkflowInProgress: boolean
  shouldHandleProofRequestAutomatically: boolean
  start(agent: Agent): void
  stop(): void
  requestAttestationCredential(): Promise<void>
}
 
export type GetAttestationChallengeData = string

export interface GetAttestationJWTData {
  signedAttestation: string,
  transactionId: string,
}

/**
 * Result of a platform attestation. `kind` tells the verifier how to validate it —
 * App Attest yields an opaque blob and Android key attestation an X.509 chain, which
 * are not interchangeable server-side.
 */
export type AttestationResult =
  | { kind: 'apple-app-attest'; keyId: string; attestation: string }
  | { kind: 'android-key-attestation'; keyId: string; certificateChain: string[] }

/** The mechanism that produced an AttestationResult. */
export type AttestationKind = AttestationResult['kind']

/**
 * Platform attestation primitives. Injected via TOKENS.ATTESTATION_PROVIDER so
 * consumers choose their own implementation and only pull in its dependencies.
 */
export interface AttestationProvider {
  /** Whether this device can attest. */
  isSupported(): Promise<boolean>
  /** Perform attestation over `challenge`, which already includes the key thumbprint. */
  attest(challenge: string): Promise<AttestationResult>
}

export interface GetAttestationJWTPayload {
  attestation: string | string[]
  challenge: string
  keyId?: string
  signingKey: Kms.PublicJwk
  platform: string
  /**
   * Which attestation mechanism produced `attestation`, so the verifier need not
   * infer it from `platform`.
   */
  attestationKind?: AttestationKind
}

const NO_PROVIDER_REGISTERED =
  'No AttestationProvider registered. Register TOKENS.ATTESTATION_PROVIDER with ' +
  'expoAttestationProvider from @bifold/expo-attestation, or your own implementation.'

/**
 * Default registered by the container. Core cannot default to a real provider without
 * depending on its native module, which autolinking would then force on every consumer.
 */
export const unregisteredAttestationProvider: AttestationProvider = {
  isSupported: () => Promise.reject(new Error(NO_PROVIDER_REGISTERED)),
  attest: () => Promise.reject(new Error(NO_PROVIDER_REGISTERED)),
}
