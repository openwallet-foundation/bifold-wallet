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

// This is the test data set that is used to mock
// the react hooks. Use `uuidgen | tr '[:upper:]' '[:lower:]'`
// to generate new UUIDs.
// To create a new "transaction":
// 1. Add OOB, update createdAt, updatedAt, id, threadId, invitationId
// update labels, goal, goalCode, DIDs if needed
// 2. Add Connection, update createdAt, updatedAt, id, outOfBandId
// at a minimum.
// 3. Add Proof OR Credential Offer, update as needed.
const mockOobRecords = [
  {
    getTags: jest.fn().mockReturnValue({
      invitationId: 'd5b67d62-8592-4041-8144-20985fda1373',
      recipientKeyFingerprints: [],
      role: 'receiver',
      state: 'prepare-response',
      threadId: 'd5b67d62-8592-4041-8144-20985fda1373',
    }),
    // _tags: {
    //   invitationId: 'd5b67d62-8592-4041-8144-20985fda1373',
    //   recipientKeyFingerprints: [],
    //   role: 'receiver',
    //   state: 'prepare-response',
    //   threadId: 'd5b67d62-8592-4041-8144-20985fda1373',
    // },
    autoAcceptConnection: true,
    createdAt: new Date('2024-09-04T18:50:27.350Z'),
    id: 'b8aaa6fe-47c9-4ed8-8cb9-96299e4e0109',
    metadata: {},
    outOfBandInvitation: {
      '@id': 'd5b67d62-8592-4041-8144-20985fda1373',
      '@type': 'https://didcomm.org/out-of-band/1.0/invitation',
      goal: 'Showcase connection',
      goalCode: 'aries.vc.issue',
      handshake_protocols: [],
      label: 'BestBC College',
      'requests~attach': undefined,
      services: [],
      '~attach': undefined,
      '~l10n': undefined,
      '~please_ack': undefined,
      '~service': undefined,
      '~thread': undefined,
      '~timing': undefined,
      '~transport': undefined,
    },
    reusable: false,
    role: 'receiver',
    state: 'prepare-response',
    updatedAt: new Date('2024-09-04T18:50:27.404Z'),
  },
  {
    getTags: jest.fn().mockReturnValue({
      invitationId: '91c0a070-8030-493e-9c42-17a2b0d327bc',
      recipientKeyFingerprints: [Array],
      role: 'receiver',
      state: 'prepare-response',
      threadId: '91c0a070-8030-493e-9c42-17a2b0d327bc',
    }),
    // _tags: {
    //   invitationId: '91c0a070-8030-493e-9c42-17a2b0d327bc',
    //   recipientKeyFingerprints: [Array],
    //   role: 'receiver',
    //   state: 'prepare-response',
    //   threadId: '91c0a070-8030-493e-9c42-17a2b0d327bc',
    // },
    autoAcceptConnection: true,
    createdAt: new Date('2024-09-04T21:12:12.014Z'),
    id: 'bc37583b-cee1-43aa-96f4-b7087b71fbc5',
    metadata: {},
    outOfBandInvitation: {
      '@id': '91c0a070-8030-493e-9c42-17a2b0d327bc',
      '@type': 'https://didcomm.org/out-of-band/1.0/invitation',
      goal: 'Showcase connection',
      goalCode: 'aries.vc.verify',
      handshake_protocols: [],
      label: 'Cool Clothes Online',
      'requests~attach': undefined,
      services: [],
      '~attach': undefined,
      '~l10n': undefined,
      '~please_ack': undefined,
      '~service': undefined,
      '~thread': undefined,
      '~timing': undefined,
      '~transport': undefined,
    },
    reusable: false,
    role: 'receiver',
    state: 'prepare-response',
    updatedAt: new Date('2024-09-04T21:12:12.077Z'),
  },
  {
    getTags: jest.fn().mockReturnValue({
      invitationId: 'd6d0f46b-43b4-4e81-9a02-cddd2ae2fcca',
      recipientKeyFingerprints: [],
      role: 'receiver',
      state: 'prepare-response',
      threadId: 'd6d0f46b-43b4-4e81-9a02-cddd2ae2fcca',
    }),
    // _tags: {
    //   invitationId: 'd6d0f46b-43b4-4e81-9a02-cddd2ae2fcca',
    //   recipientKeyFingerprints: [],
    //   role: 'receiver',
    //   state: 'prepare-response',
    //   threadId: 'd6d0f46b-43b4-4e81-9a02-cddd2ae2fcca',
    // },
    autoAcceptConnection: true,
    createdAt: new Date('2024-09-04T18:50:27.350Z'),
    id: 'd1036d48-4b88-4f63-9d7e-b4b0476f8108',
    metadata: {},
    outOfBandInvitation: {
      '@id': 'd6d0f46b-43b4-4e81-9a02-cddd2ae2fcca',
      '@type': 'https://didcomm.org/out-of-band/1.0/invitation',
      handshake_protocols: [],
      label: 'BestBC College',
      'requests~attach': undefined,
      services: [],
      '~attach': undefined,
      '~l10n': undefined,
      '~please_ack': undefined,
      '~service': undefined,
      '~thread': undefined,
      '~timing': undefined,
      '~transport': undefined,
    },
    reusable: false,
    role: 'receiver',
    state: 'prepare-response',
    updatedAt: new Date('2024-09-04T18:50:27.404Z'),
  },
  {
    getTags: jest.fn().mockReturnValue({
      invitationId: 'd06b0c33-ba17-42d7-9334-afdf60403f02',
      invitationRequestsThreadIds: ['dbc57c37-63b8-40ed-bb14-4b58e86db4ec'],
      recipientKeyFingerprints: ['z6Mkn7npqdZrsdyrakARurzW67MEjYjJCtWeNU2MvF2h5dor'],
      role: 'receiver',
      state: 'prepare-response',
      threadId: 'd06b0c33-ba17-42d7-9334-afdf60403f02',
    }),
    // _tags: {
    //   invitationId: 'd06b0c33-ba17-42d7-9334-afdf60403f02',
    //   invitationRequestsThreadIds: ['dbc57c37-63b8-40ed-bb14-4b58e86db4ec'],
    //   recipientKeyFingerprints: ['z6Mkn7npqdZrsdyrakARurzW67MEjYjJCtWeNU2MvF2h5dor'],
    //   role: 'receiver',
    //   state: 'prepare-response',
    //   threadId: 'd06b0c33-ba17-42d7-9334-afdf60403f02',
    // },
    metadata: {},
    id: '548ee21c-5b98-4eeb-8fe0-5a5019a5f4a5',
    createdAt: new Date('2024-09-05T18:56:08.454Z'),
    outOfBandInvitation: {
      '@type': 'https://didcomm.org/out-of-band/1.1/invitation',
      '@id': 'd06b0c33-ba17-42d7-9334-afdf60403f02',
      services: [
        {
          id: 'e6b8315d-ef44-4f64-9a2b-b994ecd8c2d4',
          serviceEndpoint: 'https://vc-authn-oidc-agent-test.apps.silver.devops.gov.bc.ca',
          type: 'did-communication',
          recipientKeys: ['did:key:z6Mkn7npqdZrsdyrakARurzW67MEjYjJCtWeNU2MvF2h5dor'],
          routingKeys: [],
        },
      ],
      'requests~attach': [
        {
          '@id': '9641549a-59ce-4cd1-b96f-559aa1752c72',
          'mime-type': 'application/json',
          data: {
            base64:
              'eyJAaWQiOiJkYmM1N2MzNy02M2I4LTQwZWQtYmIxNC00YjU4ZTg2ZGI0ZWMiLCJAdHlwZSI6ImRpZDpzb3Y6QnpDYnNOWWhNcmpIaXFaRFRVQVNIZztzcGVjL3ByZXNlbnQtcHJvb2YvMS4wL3JlcXVlc3QtcHJlc2VudGF0aW9uIiwicmVxdWVzdF9wcmVzZW50YXRpb25zfmF0dGFjaCI6W3siQGlkIjoibGliaW5keS1yZXF1ZXN0LXByZXNlbnRhdGlvbi0wIiwibWltZS10eXBlIjoiYXBwbGljYXRpb24vanNvbiIsImRhdGEiOnsiYmFzZTY0IjoiZXlKdWIyNWpaU0k2SUNJeE9Ea3pPVEE0TURZNE9USTRNRFEyTVRZNU5UYzVJaXdnSW01aGJXVWlPaUFpY0hKdmIyWmZjbVZ4ZFdWemRHVmtJaXdnSW5abGNuTnBiMjRpT2lBaU1DNHdMakVpTENBaWNtVnhkV1Z6ZEdWa1gyRjBkSEpwWW5WMFpYTWlPaUI3SW5KbGNWOWhkSFJ5WHpBaU9pQjdJbTVoYldWeklqb2dXeUpRVUVsRUlpd2dJa2RwZG1WdUlFNWhiV1VpTENBaVUzVnlibUZ0WlNJc0lDSk5aVzFpWlhJZ1UzUmhkSFZ6SWl3Z0lrMWxiV0psY2lCVGRHRjBkWE1nUTI5a1pTSmRMQ0FpY21WemRISnBZM1JwYjI1eklqb2dXM3NpYzJOb1pXMWhYMjVoYldVaU9pQWlUV1Z0WW1WeUlFTmxjblJwWm1sallYUmxJaXdnSW5OamFHVnRZVjkyWlhKemFXOXVJam9nSWpFdU1DNHhJaXdnSW1semMzVmxjbDlrYVdRaU9pQWlSRnBDWVVobmFFdHpWa2hqU205cGQydDVhMGN6Y2lKOUxDQjdJbk5qYUdWdFlWOXVZVzFsSWpvZ0lrMWxiV0psY2lCRFlYSmtJaXdnSW5OamFHVnRZVjkyWlhKemFXOXVJam9nSWpFdU5TNHhJaXdnSW1semMzVmxjbDlrYVdRaU9pQWlRWFZLY21sblMxRkhVa3hLWVdwTFFXVmlWR2RYZFNKOUxDQjdJbk5qYUdWdFlWOXVZVzFsSWpvZ0lrMWxiV0psY2lCRFlYSmtJaXdnSW5OamFHVnRZVjkyWlhKemFXOXVJam9nSWpFdU5TNHhJaXdnSW1semMzVmxjbDlrYVdRaU9pQWlOSGhGTmpoaU5sTTFWbEpHY2t0TlRVY3hWVGsxVFNKOVhTd2dJbTV2Ymw5eVpYWnZhMlZrSWpvZ2V5Sm1jbTl0SWpvZ01UY3lOVFUyTWpVMU1pd2dJblJ2SWpvZ01UY3lOVFUyTWpVMU1uMTlMQ0FpY21WeFgyRjBkSEpmTVNJNklIc2libUZ0WlhNaU9pQmJJbVpoYldsc2VWOXVZVzFsSWl3Z0ltZHBkbVZ1WDI1aGJXVnpJbDBzSUNKeVpYTjBjbWxqZEdsdmJuTWlPaUJiZXlKelkyaGxiV0ZmYm1GdFpTSTZJQ0pRWlhKemIyNGlMQ0FpYzJOb1pXMWhYM1psY25OcGIyNGlPaUFpTVM0d0lpd2dJbWx6YzNWbGNsOWthV1FpT2lBaVMwTjRWa000UjJ0TGVYZHFhRmRLYmxWbVEyMXJWeUo5TENCN0luTmphR1Z0WVY5dVlXMWxJam9nSW5WdWRtVnlhV1pwWldSZmNHVnljMjl1SWl3Z0luTmphR1Z0WVY5MlpYSnphVzl1SWpvZ0lqQXVNUzR3SWl3Z0ltbHpjM1ZsY2w5a2FXUWlPaUFpV0ZwUmNIbGhSbUU1YUVKVlpFcFlaa3RJVlhaV1p5SjlMQ0I3SW5OamFHVnRZVjl1WVcxbElqb2dJblZ1ZG1WeWFXWnBaV1JmY0dWeWMyOXVJaXdnSW5OamFHVnRZVjkyWlhKemFXOXVJam9nSWpBdU1TNHdJaXdnSW1semMzVmxjbDlrYVdRaU9pQWlTRlJyYUdoRFZ6RmlRVmhYYm5oRE1YVXpXVlp2WVNKOUxDQjdJbk5qYUdWdFlWOXVZVzFsSWpvZ0luVnVkbVZ5YVdacFpXUmZjR1Z5YzI5dUlpd2dJbk5qYUdWdFlWOTJaWEp6YVc5dUlqb2dJakF1TkM0d0lpd2dJbWx6YzNWbGNsOWthV1FpT2lBaU9GbHhOMFZvUzBKTmRXcG9NalZPYTB4SFIySXlkQ0o5TENCN0luTmphR1Z0WVY5dVlXMWxJam9nSWxCbGNuTnZiaUlzSUNKelkyaGxiV0ZmZG1WeWMybHZiaUk2SUNJeExqQWlMQ0FpYVhOemRXVnlYMlJwWkNJNklDSlNSMnBYWWxjeFpYbGpVRGRHY2sxbU5GRktkbGc0SW4xZExDQWlibTl1WDNKbGRtOXJaV1FpT2lCN0ltWnliMjBpT2lBeE56STFOVFl5TlRVeUxDQWlkRzhpT2lBeE56STFOVFl5TlRVeWZYMTlMQ0FpY21WeGRXVnpkR1ZrWDNCeVpXUnBZMkYwWlhNaU9pQjdmWDA9In19XSwiY29tbWVudCI6bnVsbH0=',
          },
        },
      ],
    },
    role: 'receiver',
    state: 'prepare-response',
    autoAcceptConnection: true,
    reusable: false,
    updatedAt: new Date('2024-09-05T18:56:08.530Z'),
  },
  ///
  {
    getTags: jest.fn().mockReturnValue({
      invitationId: 'b280fdd5-5cfa-4e49-8ab1-cbd13fa67636',
      recipientKeyFingerprints: [],
      role: 'receiver',
      state: 'prepare-response',
      threadId: 'b280fdd5-5cfa-4e49-8ab1-cbd13fa67636',
    }),
    // _tags: {
    //   invitationId: 'b280fdd5-5cfa-4e49-8ab1-cbd13fa67636',
    //   recipientKeyFingerprints: [],
    //   role: 'receiver',
    //   state: 'prepare-response',
    //   threadId: 'b280fdd5-5cfa-4e49-8ab1-cbd13fa67636',
    // },
    autoAcceptConnection: true,
    createdAt: new Date('2024-09-01T21:12:12.014Z'),
    id: '27cfe0f6-253d-4105-a87e-2d8b1b0234c3',
    metadata: {},
    outOfBandInvitation: {
      '@id': 'b280fdd5-5cfa-4e49-8ab1-cbd13fa67636',
      '@type': 'https://didcomm.org/out-of-band/1.0/invitation',
      goal: 'Coffee Connection',
      goalCode: 'aries.vc.verify.once',
      handshake_protocols: [],
      label: 'Cool Coffee Online',
      'requests~attach': undefined,
      services: [],
      '~attach': undefined,
      '~l10n': undefined,
      '~please_ack': undefined,
      '~service': undefined,
      '~thread': undefined,
      '~timing': undefined,
      '~transport': undefined,
    },
    reusable: false,
    role: 'receiver',
    state: 'prepare-response',
    updatedAt: new Date('2024-09-01T21:12:12.077Z'),
  },
  {
    getTags: jest.fn().mockReturnValue({
      invitationId: 'f98ae4fd-21e4-4002-9bdf-9b3bf36e6899',
      recipientKeyFingerprints: [],
      role: 'receiver',
      state: 'prepare-response',
      threadId: 'f98ae4fd-21e4-4002-9bdf-9b3bf36e6899',
    }),
    // _tags: {
    //   invitationId: 'f98ae4fd-21e4-4002-9bdf-9b3bf36e6899',
    //   recipientKeyFingerprints: [],
    //   role: 'receiver',
    //   state: 'prepare-response',
    //   threadId: 'f98ae4fd-21e4-4002-9bdf-9b3bf36e6899',
    // },
    autoAcceptConnection: true,
    createdAt: new Date('2024-09-06T18:50:27.350Z'),
    id: '6e739679-db69-4228-9fdf-d1b8cc2431aa',
    metadata: {},
    outOfBandInvitation: {
      '@id': 'f98ae4fd-21e4-4002-9bdf-9b3bf36e6899',
      '@type': 'https://didcomm.org/out-of-band/1.0/invitation',
      goal: 'Make Great Tea',
      goalCode: 'aries.vc.happy-teapot',
      handshake_protocols: [],
      label: 'BestBC Tea',
      'requests~attach': undefined,
      services: [],
      '~attach': undefined,
      '~l10n': undefined,
      '~please_ack': undefined,
      '~service': undefined,
      '~thread': undefined,
      '~timing': undefined,
      '~transport': undefined,
    },
    reusable: false,
    role: 'receiver',
    state: 'prepare-response',
    updatedAt: new Date('2024-09-06T18:50:27.404Z'),
  },
]
const mockConnectionRecords = [
  new ConnectionRecord({
    // Offer
    id: 'b4b1b9cd-a445-4bb3-9645-a2377471965a',
    outOfBandId: 'b8aaa6fe-47c9-4ed8-8cb9-96299e4e0109',
    did: 'did:peer:1zQmZYcmJeMX5Lc2HvQjf4VXSC3raHfBci6A4MnjDNCZTVp9',
    theirLabel: 'BestBC College',
    role: DidExchangeRole.Requester,
    theirDid: 'did:peer:1zQmaiE6oyFzYYdBtKD3fJW6yfXE1r5hXMLfa7Ve8nundki6',
    threadId: '5c667314-6465-4fa8-9a45-f66e571e99e2',
    state: DidExchangeState.Completed,
    createdAt: new Date('2024-09-04T18:50:28.647Z'),
  }),
  new ConnectionRecord({
    // Proof
    id: '20f1f732-b64f-4d52-99fd-e13fe0d9e62f',
    outOfBandId: 'bc37583b-cee1-43aa-96f4-b7087b71fbc5',
    did: 'did:peer:1zQmRRUJPpFLScPNFuE9HLPJ6N3MRACb5J3ZYjnDHfvvfZG2',
    theirLabel: 'Cool Clothes Online',
    role: DidExchangeRole.Requester,
    theirDid: 'did:peer:1zQmeXt27PyTpgf1sYEQV45jP1WYTU63raWMzhQtKhxCzxzF',
    threadId: '8c5846e2-c36f-42a2-a403-6edeb2850bcb',
    state: DidExchangeState.ResponseReceived,
    createdAt: new Date('2024-09-04T21:12:12.655Z'),
  }),
  new ConnectionRecord({
    // Offer
    id: '3712d956-7731-428b-bcbb-127c0f6d615d',
    outOfBandId: 'd1036d48-4b88-4f63-9d7e-b4b0476f8108',
    did: 'did:peer:1zQmZYcmJeMX5Lc2HvQjf4VXSC3raHfBci6A4MnjDNCZTVp9',
    theirLabel: 'BestBC College',
    role: DidExchangeRole.Requester,
    theirDid: 'did:peer:1zQmaiE6oyFzYYdBtKD3fJW6yfXE1r5hXMLfa7Ve8nundki6',
    threadId: '8df1d523-5415-4e62-9975-4d248fcb8f4a',
    state: DidExchangeState.Completed,
    createdAt: new Date('2024-09-04T18:50:28.647Z'),
  }),
  new ConnectionRecord({
    // Proof
    id: 'efa7d36e-9dbe-4c0b-b128-556e731d329a',
    outOfBandId: '27cfe0f6-253d-4105-a87e-2d8b1b0234c3',
    did: 'did:peer:1zQmRRUJPpFLScPNFuE9HLPJ6N3MRACb5J3ZYjnDHfvvfZG2',
    theirLabel: 'Cool Coffee Online',
    role: DidExchangeRole.Requester,
    theirDid: 'did:peer:1zQmeXt27PyTpgf1sYEQV45jP1WYTU63raWMzhQtKhxCzxzF',
    threadId: 'ad1b6c8d-d098-49f6-a841-dbf1072bf2fb',
    state: DidExchangeState.ResponseReceived,
    createdAt: new Date('2024-09-01T21:12:12.655Z'),
  }),
  new ConnectionRecord({
    // Offer
    id: 'c426f2dc-0ffc-4252-b7d6-2304755f84d9',
    outOfBandId: '6e739679-db69-4228-9fdf-d1b8cc2431aa',
    did: 'did:peer:1zQmZYcmJeMX5Lc2HvQjf4VXSC3raHfBci6A4MnjDNCZTVp9',
    theirLabel: 'BestBC Tea',
    role: DidExchangeRole.Requester,
    theirDid: 'did:peer:1zQmaiE6oyFzYYdBtKD3fJW6yfXE1r5hXMLfa7Ve8nundki6',
    threadId: 'fc7405e5-039c-4b7a-bc3d-f9626fc96d25',
    state: DidExchangeState.Completed,
    createdAt: new Date('2024-09-04T18:50:28.647Z'),
  }),
]
// @ts-ignore-next-line
const mockProofRecords = [
  {
    // Connected Proof
    _tags: {
      connectionId: '20f1f732-b64f-4d52-99fd-e13fe0d9e62f',
      role: 'prover',
      state: 'request-received',
      threadId: '985a0d98-bc31-435c-a3fe-2f884acae4fe',
    },
    metadata: {},
    id: 'c54dfe4e-925d-4b9a-9f2c-2adeb308c5de',
    createdAt: new Date('2024-09-04T21:12:14.072Z'),
    protocolVersion: 'v1',
    state: 'request-received',
    role: 'prover',
    connectionId: '20f1f732-b64f-4d52-99fd-e13fe0d9e62f',
    threadId: '985a0d98-bc31-435c-a3fe-2f884acae4fe',
    updatedAt: new Date('2024-09-04T21:12:14.108Z'),
  },
  {
    // Connectionless Proof
    _tags: {},
    autoAcceptProof: undefined,
    connectionId: undefined,
    createdAt: new Date('2024-09-05T18:56:08.770Z'),
    errorMessage: undefined,
    id: '5658ee3f-04dc-487a-8524-3e070c820b8e',
    isVerified: undefined,
    metadata: {},
    parentThreadId: 'd06b0c33-ba17-42d7-9334-afdf60403f02',
    protocolVersion: 'v1',
    role: 'prover',
    state: 'request-received',
    threadId: 'dbc57c37-63b8-40ed-bb14-4b58e86db4ec',
    updatedAt: new Date('2024-09-05T18:56:08.796Z'),
  },
  {
    // Connected Proof
    _tags: {
      connectionId: 'efa7d36e-9dbe-4c0b-b128-556e731d329a',
      role: 'prover',
      state: 'request-received',
      threadId: '78de35dd-980e-4379-a668-3a6e9c4365d4',
    },
    metadata: {},
    id: 'bbbf9c83-7930-4c97-944f-9b6adbbc8f49',
    createdAt: new Date('2024-09-04T21:12:14.072Z'),
    protocolVersion: 'v1',
    state: 'request-received',
    role: 'prover',
    connectionId: 'efa7d36e-9dbe-4c0b-b128-556e731d329a',
    threadId: '78de35dd-980e-4379-a668-3a6e9c4365d4',
    updatedAt: new Date('2024-09-04T21:12:14.108Z'),
  },
] as ProofExchangeRecord[]
const mockBasicMessages = { records: [] as BasicMessageRecord[] }

const useProofByState = jest.fn().mockReturnValue(mockProofRecords)
const useBasicMessagesByConnectionId = jest.fn().mockReturnValue([] as BasicMessageRecord[])
const useBasicMessages = jest.fn().mockReturnValue(mockBasicMessages)
const mockCredentialModule = {
  credentials: [
    {
      _tags: {},
      metadata: {
        get: jest.fn().mockReturnValue({
          schemaId: 'QEquAHkM35w4XVT3Ku5yat:2:student_card:1.6',
          credentialDefinitionId: 'QEquAHkM35w4XVT3Ku5yat:3:CL:834668:student_card',
        }),
        // '_anoncreds/credential': {
        //   schemaId: 'QEquAHkM35w4XVT3Ku5yat:2:student_card:1.6',
        //   credentialDefinitionId: 'QEquAHkM35w4XVT3Ku5yat:3:CL:834668:student_card',
        // },
      },
      credentials: [],
      id: '99bbf805-fc82-44dc-82eb-e3eb1e7f8ab7',
      createdAt: new Date('2024-09-04T18:50:29.771Z'),
      state: 'offer-received',
      role: 'holder',
      connectionId: 'b4b1b9cd-a445-4bb3-9645-a2377471965a',
      threadId: '735df561-5346-4cb0-b11f-44a49984c0c3',
      protocolVersion: 'v1',
      credentialAttributes: [
        {
          'mime-type': 'text/plain',
          name: 'student_first_name',
          value: 'Alice',
        },
        {
          'mime-type': 'text/plain',
          name: 'student_last_name',
          value: 'Smith',
        },
        {
          'mime-type': 'text/plain',
          name: 'expiry_date',
          value: '20280820',
        },
      ],
      updatedAt: new Date('2024-09-04T18:50:29.802Z'),
    },
  ],
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
  findRequestMessage: jest.fn().mockReturnValue(Promise.resolve(null)),
  requestProof: jest.fn(),
  update: jest.fn(),
  findAllByQuery: jest.fn().mockReturnValue(Promise.resolve([])),
}
const mockBasicMessagesModule = {
  findAllByQuery: jest.fn().mockReturnValue(Promise.resolve([])),
}
const mockConnectionsModule = {
  getAll: jest.fn().mockReturnValue(Promise.resolve(mockConnectionRecords)),
}

const mockMediationRecipient = {
  initiateMessagePickup: jest.fn(),
}
const mockOobModule = {
  findById: jest.fn().mockImplementation((id: string) => {
    return Promise.resolve(mockOobRecords.find((oob) => oob.id === id))
  }),
  createInvitation: jest.fn(),
  toUrl: jest.fn(),
  findByReceivedInvitationId: jest.fn().mockReturnValue(Promise.resolve(null)),
  parseInvitation: jest.fn().mockReturnValue(Promise.resolve(null)),
}
const mockBasicMessageRepository = {
  update: jest.fn(),
}
const mockAgentContext = {
  dependencyManager: {
    resolve: jest.fn().mockReturnValue(mockBasicMessageRepository),
  },
}
const agent = {
  agent: {
    credentials: mockCredentialModule,
    proofs: mockProofModule,
    basicMessages: mockBasicMessagesModule,
    connections: mockConnectionsModule,
    mediationRecipient: mockMediationRecipient,
    oob: mockOobModule,
    context: mockAgentContext,
    receiveMessage: jest.fn(),
    config: { logger: { error: jest.fn() } },
  },
}

//mocked react hooks should return singleton objects to avoid unecessary re-renderings
const useAgent = jest.fn().mockReturnValue(agent)

// @ts-ignore-next-line
// const useCredentialById = jest.fn().mockReturnValue(mockCredentialModule.credentials[0] as CredentialExchangeRecord)
const useCredentialById = jest.fn().mockImplementation((id: string) => {
  return mockCredentialModule.credentials.find((cred) => cred.id === id)
})
const useProofById = jest.fn().mockImplementation((id: string) => {
  return mockProofRecords.find((proof) => proof.id === id)
})
const useConnectionById = jest.fn()
const usedConnections = { records: mockConnectionRecords }
const useConnections = jest.fn().mockReturnValue(usedConnections)

const useCredentials = jest.fn().mockReturnValue({ records: [] } as any)
const useProofs = jest.fn().mockReturnValue({ records: [] } as any)
const useCredentialByState = jest.fn().mockImplementation((state: string) => {
  return mockCredentialModule.credentials.filter((cred) => cred.state === state)
})

export {
  useAgent,
  useBasicMessages,
  useBasicMessagesByConnectionId,
  useConnectionById,
  useConnections,
  useCredentialById,
  useCredentialByState,
  useProofByState,
  useCredentials,
  useProofById,
  useProofs,
}
