import { INDY_PROOF_REQUEST_ATTACHMENT_ID, V1RequestPresentationMessage } from '@credo-ts/anoncreds'
import {
  CredentialExchangeRecord,
  CredentialRole,
  CredentialState,
  ProofExchangeRecord,
  ProofRole,
  ProofState,
} from '@credo-ts/core'
import { Attachment, AttachmentData } from '@credo-ts/core/build/decorators/attachment/Attachment'
import { useAgent, useProofById } from '@credo-ts/react-hooks'
import mockRNCNetInfo from '@react-native-community/netinfo/jest/netinfo-mock'
import { useNavigation } from '@react-navigation/native'
import '@testing-library/jest-native'
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react-native'
import React from 'react'

import ProofChangeCredential from '../../src/screens/ProofChangeCredential'
import { testIdWithKey } from '../../src/utils/testable'
import timeTravel from '../helpers/timetravel'
import { BasicAppContext } from '../helpers/app'

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter')
jest.mock('@react-native-community/netinfo', () => mockRNCNetInfo)
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')
jest.useFakeTimers({ legacyFakeTimers: true })
jest.spyOn(global, 'setTimeout')

describe('ProofChangeCredential Screen', () => {
  const testEmail = 'test@email.com'
  const testTime = '2022-02-11 20:00:18.180718'
  const testAge = '16'
  const testEmail2 = 'test2@email.com'
  const testTime2 = '2023-02-11 20:00:18.180718'
  const testAge2 = '17'

  const { id: presentationMessageId } = new V1RequestPresentationMessage({
    comment: 'some comment',
    requestAttachments: [
      new Attachment({
        id: INDY_PROOF_REQUEST_ATTACHMENT_ID,
        mimeType: 'application/json',
        data: new AttachmentData({
          json: {
            name: 'test proof request',
            version: '1.0.0',
            nonce: '1',
            requestedAttributes: {
              email: {
                name: 'email',
              },
              time: {
                name: 'time',
              },
            },
            requestedPredicates: {
              age: {
                name: 'age',
                pType: '<=',
                pValue: 18,
              },
            },
          },
        }),
      }),
    ],
  })

  const attributeBase = {
    referent: '',
    schemaId: '',
    credentialDefinitionId: 'AAAAAAAAAAAAAAAAAAAAAA:3:CL:1234:test',
    toJSON: jest.fn(),
  }

  const testProofRequest = new ProofExchangeRecord({
    role: ProofRole.Prover,
    connectionId: '',
    threadId: presentationMessageId,
    state: ProofState.RequestReceived,
    protocolVersion: 'V1',
  })

  const testProofFormatData = {
    request: {
      indy: {
        requested_attributes: {
          email: {
            name: 'email',
            restrictions: [
              {
                cred_def_id: attributeBase.credentialDefinitionId,
              },
            ],
          },
          time: {
            name: 'time',
            restrictions: [
              {
                cred_def_id: attributeBase.credentialDefinitionId,
              },
            ],
          },
        },
        requested_predicates: {
          age: {
            name: 'age',
            p_type: '<=',
            p_value: 18,
            restrictions: [{ cred_def_id: attributeBase.credentialDefinitionId }],
          },
        },
      },
    },
  }

  const { id: credentialId } = new CredentialExchangeRecord({
    role: CredentialRole.Holder,
    threadId: '1',
    state: CredentialState.Done,
    credentialAttributes: [
      {
        name: 'email',
        value: testEmail,
        toJSON: jest.fn(),
      },
      {
        name: 'time',
        value: testTime,
        toJSON: jest.fn(),
      },
      {
        name: 'age',
        value: testAge,
        toJSON: jest.fn(),
      },
    ],
    protocolVersion: 'v1',
  })
  const { id: credentialId2 } = new CredentialExchangeRecord({
    role: CredentialRole.Holder,
    threadId: '1',
    state: CredentialState.Done,
    credentialAttributes: [
      {
        name: 'email',
        value: testEmail2,
        toJSON: jest.fn(),
      },
      {
        name: 'time',
        value: testTime2,
        toJSON: jest.fn(),
      },
      {
        name: 'age',
        value: testAge2,
        toJSON: jest.fn(),
      },
    ],
    protocolVersion: 'v1',
  })

  const testRetrievedCredentials2 = {
    proofFormats: {
      indy: {
        predicates: {
          age: [
            {
              credentialId: credentialId,
              revealed: true,
              credentialInfo: {
                ...attributeBase,
                credentialId: credentialId,
                attributes: { age: testAge },
              },
            },
            {
              credentialId: credentialId2,
              revealed: true,
              credentialInfo: {
                ...attributeBase,
                credentialId: credentialId2,
                attributes: { age: testAge2 },
              },
            },
          ],
        },
        attributes: {
          email: [
            {
              credentialId: credentialId,
              revealed: true,
              credentialInfo: {
                ...attributeBase,
                credentialId: credentialId,
                attributes: { email: testEmail },
              },
            },
            {
              credentialId: credentialId2,
              revealed: true,
              credentialInfo: {
                ...attributeBase,
                credentialId: credentialId2,
                attributes: { email: testEmail2 },
              },
            },
          ],
          time: [
            {
              credentialId: credentialId,
              revealed: true,
              credentialInfo: {
                ...attributeBase,
                attributes: { time: testTime },
                credentialId: credentialId,
              },
            },
            {
              credentialId: credentialId2,
              revealed: true,
              credentialInfo: {
                ...attributeBase,
                attributes: { time: testTime2 },
                credentialId: credentialId2,
              },
            },
          ],
        },
      },
    },
  }
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('with multiple credentials', () => {
    beforeEach(() => {
      jest.clearAllMocks()

      // @ts-expect-error useProofById will be replaced with a mock which does have this method
      useProofById.mockReturnValue(testProofRequest)
    })

    test('test credential selection', async () => {
      const { agent } = useAgent()

      // @ts-expect-error this method will be replaced with a mock which does have this method
      agent?.proofs.getFormatData.mockResolvedValue(testProofFormatData)

      // @ts-expect-error this method will be replaced with a mock which does have this method
      agent?.proofs.getCredentialsForRequest.mockResolvedValue(testRetrievedCredentials2)

      const navigation = useNavigation()

      const onCredChange = jest.fn()
      const tree = render(
        <BasicAppContext>
          <ProofChangeCredential
            navigation={navigation as any}
            route={
              {
                params: {
                  proofId: testProofRequest.id,
                  selectedCred: credentialId,
                  altCredentials: [credentialId, credentialId2],
                  onCredChange,
                },
              } as any
            }
          />
        </BasicAppContext>
      )

      await waitFor(() => {
        timeTravel(1000)
      })

      const firstCred = tree.getByTestId(testIdWithKey(`select:${credentialId}`))
      expect(firstCred).not.toBeNull()
      fireEvent(firstCred, 'press')
      expect(navigation.goBack).toBeCalledTimes(1)
      expect(onCredChange).toBeCalledTimes(1)
    })
  })
})
