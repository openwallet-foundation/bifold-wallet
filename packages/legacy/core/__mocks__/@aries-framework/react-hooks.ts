/* eslint-disable @typescript-eslint/no-explicit-any */
import { LegacyIndyCredentialFormat } from '@aries-framework/anoncreds'
import { CredentialExchangeRecord, CredentialProtocolOptions, ProofExchangeRecord } from '@aries-framework/core'

const useCredentials = jest.fn().mockReturnValue({ credentials: [] } as any)
const useCredentialByState = jest.fn().mockReturnValue([] as CredentialExchangeRecord[])
const useProofByState = jest.fn().mockReturnValue([] as ProofExchangeRecord[])
const mockCredentialModule = {
  acceptOffer: jest.fn(),
  declineOffer: jest.fn(),
  getFormatData: jest
    .fn()
    .mockReturnValue(
      Promise.resolve({} as CredentialProtocolOptions.GetCredentialFormatDataReturn<[LegacyIndyCredentialFormat]>)
    ),
}
const mockProofModule = {
  getCredentialsForRequest: jest.fn(),
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
