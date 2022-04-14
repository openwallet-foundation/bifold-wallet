import { CredentialRecord, ProofRecord } from '@aries-framework/core'

const useCredentials = jest.fn().mockReturnValue({ credentials: [] } as any)
const useCredentialByState = jest.fn().mockReturnValue([] as CredentialRecord[])
const useProofByState = jest.fn().mockReturnValue([] as ProofRecord[])
const mockCredentialModule = {
  acceptOffer: jest.fn(),
  declineOffer: jest.fn(),
}
const mockProofModule = {
  getRequestedCredentialsForProofRequest: jest.fn(),
  acceptRequest: jest.fn(),
  declineRequest: jest.fn(),
}
const useAgent = () => ({
  agent: {
    credentials: mockCredentialModule,
    proofs: mockProofModule,
  },
})
const useCredentialById = jest.fn()
const useProofById = jest.fn()
const useConnectionById = jest.fn()

export {
  useAgent,
  useConnectionById,
  useCredentials,
  useCredentialById,
  useCredentialByState,
  useProofById,
  useProofByState,
}
