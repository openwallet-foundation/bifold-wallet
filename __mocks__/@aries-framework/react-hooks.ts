import { CredentialRecord, ProofRecord } from '@aries-framework/core'

const useCredentials = jest.fn().mockReturnValue({ credentials: [] } as any)
const useCredentialByState = jest.fn().mockReturnValue([] as CredentialRecord[])
const useProofByState = jest.fn().mockReturnValue([] as ProofRecord[])
const mockAgent = {
  acceptOffer: jest.fn(),
  declineOffer: jest.fn(),
}
const useAgent = () => ({
  agent: {
    credentials: mockAgent,
  },
})
const useCredentialById = jest.fn()

export { useAgent, useCredentialById, useCredentials, useCredentialByState, useProofByState }
