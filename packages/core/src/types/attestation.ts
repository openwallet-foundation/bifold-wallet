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

export interface GetAttestationJWTPayload {
  attestationResult: string | string[]
  challenge: string
  keyId: string
  signingKey?: Kms.PublicJwk
}
