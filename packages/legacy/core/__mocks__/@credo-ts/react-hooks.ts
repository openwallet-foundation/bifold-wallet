/* eslint-disable @typescript-eslint/no-explicit-any */
import { LegacyIndyCredentialFormat } from '@credo-ts/anoncreds'
import {
  BasicMessageRecord,
  CredentialExchangeRecord,
  CredentialProtocolOptions,
  ProofExchangeRecord,
  ConnectionRecord,
  DidExchangeRole,
  DidExchangeState,
} from '@credo-ts/core'

const useCredentials = jest.fn().mockReturnValue({ records: [] } as any)
const useProofs = jest.fn().mockReturnValue({ records: [] } as any)
const useCredentialByState = jest.fn().mockReturnValue([] as CredentialExchangeRecord[])
const useProofByState = jest.fn().mockReturnValue([] as ProofExchangeRecord[])
const useBasicMessagesByConnectionId = jest.fn().mockReturnValue([] as BasicMessageRecord[])
const useBasicMessages = jest.fn().mockReturnValue({ records: [] as BasicMessageRecord[] })
const mockCredentialModule = {
  acceptOffer: jest.fn(),
  declineOffer: jest.fn(),
  getFormatData: jest
    .fn()
    .mockReturnValue(
      Promise.resolve({} as CredentialProtocolOptions.GetCredentialFormatDataReturn<[LegacyIndyCredentialFormat]>)
    ),
  findAllByQuery: jest.fn().mockReturnValue(Promise.resolve([])),
}
const mockProofModule = {
  getCredentialsForRequest: jest.fn(),
  acceptRequest: jest.fn(),
  declineRequest: jest.fn(),
  getFormatData: jest.fn(),
  findRequestMessage: jest.fn(),
  requestProof: jest.fn(),
  update: jest.fn(),
  findAllByQuery: jest.fn().mockReturnValue(Promise.resolve([])),
}
const mockBasicMessagesModule = {
  findAllByQuery: jest.fn().mockReturnValue(Promise.resolve([])),
}
const mockConnectionsModule = {
  getAll: jest.fn().mockReturnValue(
    Promise.resolve([
      new ConnectionRecord({
        id: '1',
        did: '9gtPKWtaUKxJir5YG2VPxX',
        theirLabel: 'Faber',
        role: DidExchangeRole.Responder,
        theirDid: '2SBuq9fpLT8qUiQKr2RgBe',
        threadId: '1',
        state: DidExchangeState.Completed,
        createdAt: new Date('2020-01-02T00:00:00.000Z'),
      }),
      new ConnectionRecord({
        id: '2',
        did: '2SBuq9fpLT8qUiQKr2RgBe',
        role: DidExchangeRole.Requester,
        theirLabel: 'Bob',
        theirDid: '9gtPKWtaUKxJir5YG2VPxX',
        threadId: '1',
        state: DidExchangeState.Completed,
        createdAt: new Date('2020-01-01T00:00:00.000Z'),
      }),
    ])
  ),
}

const mockMediationRecipient = {
  initiateMessagePickup: jest.fn(),
}
const mockOobModule = {
  findById: jest.fn().mockReturnValue(Promise.resolve(null)),
  createInvitation: jest.fn(),
  toUrl: jest.fn(),
}
const mockBasicMessageRepository = {
  update: jest.fn(),
}
const mockAgentContext = {
  dependencyManager: {
    resolve: jest.fn().mockReturnValue(mockBasicMessageRepository),
  },
}
const useAgent = () => ({
  agent: {
    credentials: mockCredentialModule,
    proofs: mockProofModule,
    basicMessages: mockBasicMessagesModule,
    connections: mockConnectionsModule,
    mediationRecipient: mockMediationRecipient,
    oob: mockOobModule,
    context: mockAgentContext,
    receiveMessage: jest.fn(),
  },
})
const useCredentialById = jest.fn()
const useProofById = jest.fn()
const useConnectionById = jest.fn()
const useConnections = jest.fn()

export {
  useAgent,
  useBasicMessages,
  useBasicMessagesByConnectionId,
  useConnectionById,
  useConnections,
  useCredentialById,
  useCredentialByState,
  useCredentials,
  useProofById,
  useProofByState,
  useProofs,
}
