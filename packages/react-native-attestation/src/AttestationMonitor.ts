export const AttestationEventTypes = {
  Started: 'AttestationEvent.Started',
  Completed: 'AttestationEvent.Completed',
  FailedHandleOffer: 'AttestationEvent.FailedHandleOffer',
  FailedHandleProof: 'AttestationEvent.FailedHandleProof',
  FailedRequestCredential: 'AttestationEvent.FailedRequestCredential',
} as const;

export interface AttestationMonitor {
  readonly attestationWorkflowInProgress: string;
  shouldHandleProofRequestAutomatically: string;
  start(): Promise<void>;
  stop(): void;
  requestAttestationCredential(): Promise<void>;
}
