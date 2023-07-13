/* eslint-disable @typescript-eslint/no-explicit-any */
import { LegacyIndyCredentialFormat } from '@aries-framework/anoncreds'
import {
  BasicMessageRecord,
  CredentialExchangeRecord,
  CredentialProtocolOptions,
  ProofExchangeRecord,
} from '@aries-framework/core'

const mediationRecipient = jest.fn()
const useCredentials = jest.fn().mockReturnValue({ records: [] } as any)
const useProofs = jest.fn().mockReturnValue({ records: [] } as any)
const useCredentialByState = jest.fn().mockReturnValue([] as CredentialExchangeRecord[])
const useProofByState = jest.fn().mockReturnValue([] as ProofExchangeRecord[])
const useBasicMessagesByConnectionId = jest.fn().mockReturnValue([] as BasicMessageRecord[])
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

const mockMediationRecipient = {
  initiateMessagePickup: jest.fn(),
}
const mockOobModule = {
  findById: jest.fn().mockReturnValue(Promise.resolve(null))
}
const useAgent = () => ({
  agent: {
    credentials: mockCredentialModule,
    proofs: mockProofModule,
    mediationRecipient: mockMediationRecipient,
    oob: mockOobModule
  },
})
const useCredentialById = jest.fn()
const useProofById = jest.fn()
const useConnectionById = jest.fn()
const useConnections = jest.fn()

export {
  useAgent,
  useConnectionById,
  useCredentials,
  useProofs,
  useCredentialById,
  useCredentialByState,
  useProofById,
  useProofByState,
  useConnections,
  useBasicMessagesByConnectionId,
}
