import { CredentialRecord, ProofRecord } from '@aries-framework/core'

const useCredentials = jest.fn().mockReturnValue({ credentials: [] } as any)
const useCredentialByState = jest.fn().mockReturnValue([] as CredentialRecord[])
const useProofByState = jest.fn().mockReturnValue([] as ProofRecord[])

export { useCredentials, useCredentialByState, useProofByState }
