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
import '@testing-library/jest-native/extend-expect'
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react-native'
import React from 'react'

import ProofRequest from '../../App/screens/ProofRequest'
import { testIdWithKey } from '../../App/utils/testable'
import timeTravel from '../helpers/timetravel'
import { useCredentials } from '../../__mocks__/@credo-ts/react-hooks'
import { BasicAppContext } from '../helpers/app'

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter')
jest.mock('@react-native-community/netinfo', () => mockRNCNetInfo)
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')
jest.useFakeTimers({ legacyFakeTimers: true })
jest.spyOn(global, 'setTimeout')

describe('displays a proof request screen', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  /**
   * Scenario: View Presentation Request
   * Given the holder has received a presentation request notification
   * AND the holder selects a "presentation request notification" from the home screen
   * AND they are brought to the presentation request screen
   * THEN they see a presentation request
   * AND they can see the verifier's name
   * AND a list of claims being requested with their respectively matched VC claim value
   * AND the most recent credential is initially suggested for each attribute
   * AND there is a "Decline" Button
   * AND there is a "Share" Button
   */
  describe('with a proof request', () => {
    const testEmail = 'test@email.com'
    const testTime = '2022-02-11 20:00:18.180718'
    const testAge = '16'

    const credExRecord = new CredentialExchangeRecord({
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

    const { id: credentialId } = credExRecord

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

    const testProofRequest = new ProofExchangeRecord({
      role: ProofRole.Prover,
      connectionId: '',
      threadId: presentationMessageId,
      state: ProofState.RequestReceived,
      protocolVersion: 'V1',
    })

    const attributeBase = {
      referent: '',
      schemaId: '',
      credentialDefinitionId: 'AAAAAAAAAAAAAAAAAAAAAA:3:CL:1234:test',
      toJSON: jest.fn(),
    }

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

    const testRetrievedCredentials = {
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
            ],
          },
        },
      },
    }

    beforeEach(() => {
      jest.clearAllMocks()
      useCredentials.mockReturnValue({ records: [credExRecord] })
      // @ts-ignore-next-line
      useProofById.mockReturnValue(testProofRequest)
    })

    test('loading screen displays', async () => {
      const tree = render(
        <BasicAppContext>
          <ProofRequest navigation={useNavigation()} route={{ params: { proofId: testProofRequest.id } } as any} />
        </BasicAppContext>
      )

      await waitFor(() => {
        timeTravel(1000)
      })

      const cancelButton = tree.getByTestId(testIdWithKey('Cancel'))
      const recordLoading = tree.getByTestId(testIdWithKey('RecordLoading'))

      expect(recordLoading).not.toBeNull()
      expect(cancelButton).not.toBeNull()
      expect(cancelButton).not.toBeDisabled()
    })

    test('displays a proof request with all claims available', async () => {
      const { agent } = useAgent()

      // @ts-ignore-next-line
      agent?.proofs.getFormatData.mockResolvedValue(testProofFormatData)

      // @ts-ignore-next-line
      agent?.proofs.getCredentialsForRequest.mockResolvedValue(testRetrievedCredentials)

      const { getByText, getByTestId, queryByText } = render(
        <BasicAppContext>
          <ProofRequest navigation={useNavigation()} route={{ params: { proofId: testProofRequest.id } } as any} />
        </BasicAppContext>
      )

      await waitFor(() => {
        Promise.resolve()
      })

      const contact = getByText('ContactDetails.AContact', { exact: false })
      const missingInfo = queryByText('ProofRequest.IsRequestingSomethingYouDontHaveAvailable', { exact: false })
      const missingClaim = queryByText('ProofRequest.NotAvailableInYourWallet', { exact: false })
      const emailLabel = getByText(/Email/, { exact: false })
      const emailValue = getByText(testEmail)
      const timeLabel = getByText(/Time/, { exact: false })
      const timeValue = getByText(testTime)
      const shareButton = getByTestId(testIdWithKey('Share'))
      const declineButton = getByTestId(testIdWithKey('Decline'))

      expect(contact).not.toBeNull()
      expect(contact).toBeTruthy()
      expect(missingInfo).toBeNull()
      expect(emailLabel).not.toBeNull()
      expect(emailLabel).toBeTruthy()
      expect(emailValue).not.toBeNull()
      expect(emailValue).toBeTruthy()
      expect(timeLabel).not.toBeNull()
      expect(timeLabel).toBeTruthy()
      expect(timeValue).not.toBeNull()
      expect(timeValue).toBeTruthy()
      expect(missingClaim).toBeNull()
      expect(shareButton).not.toBeNull()
      expect(shareButton).toBeEnabled()
      expect(declineButton).not.toBeNull()
    })

    test('displays a proof request with multiple satisfying credentials', async () => {
      const { agent } = useAgent()
      const testEmail2 = 'test2@email.com'
      const testTime2 = '2023-02-11 20:00:18.180718'
      const testAge2 = '17'

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

      // @ts-ignore-next-line
      agent?.proofs.getFormatData.mockResolvedValue(testProofFormatData)

      // @ts-ignore-next-line
      agent?.proofs.getCredentialsForRequest.mockResolvedValue(testRetrievedCredentials2)

      const navigation = useNavigation()

      const { getByText, getByTestId, queryByText } = render(
        <BasicAppContext>
          <ProofRequest navigation={navigation as any} route={{ params: { proofId: testProofRequest.id } } as any} />
        </BasicAppContext>
      )

      await waitFor(() => {
        Promise.resolve()
      })
      const changeCred = getByText('ProofRequest.ChangeCredential', { exact: false })
      const changeCredButton = getByTestId(testIdWithKey('ChangeCredential'))
      const contact = getByText('ContactDetails.AContact', { exact: false })
      const missingInfo = queryByText('ProofRequest.IsRequestingSomethingYouDontHaveAvailable', { exact: false })
      const missingClaim = queryByText('ProofRequest.NotAvailableInYourWallet', { exact: false })
      const emailLabel = getByText(/Email/, { exact: false })
      const emailValue = getByText(testEmail)
      const timeLabel = getByText(/Time/, { exact: false })
      const timeValue = getByText(testTime)
      const shareButton = getByTestId(testIdWithKey('Share'))
      const declineButton = getByTestId(testIdWithKey('Decline'))

      expect(changeCred).not.toBeNull()
      expect(changeCredButton).not.toBeNull()
      expect(contact).not.toBeNull()
      expect(contact).toBeTruthy()
      expect(missingInfo).toBeNull()
      expect(emailLabel).not.toBeNull()
      expect(emailLabel).toBeTruthy()
      expect(emailValue).not.toBeNull()
      expect(emailValue).toBeTruthy()
      expect(timeLabel).not.toBeNull()
      expect(timeLabel).toBeTruthy()
      expect(timeValue).not.toBeNull()
      expect(timeValue).toBeTruthy()
      expect(missingClaim).toBeNull()
      expect(shareButton).not.toBeNull()
      expect(shareButton).toBeEnabled()
      expect(declineButton).not.toBeNull()

      fireEvent(changeCredButton, 'press')
      expect(navigation.navigate).toBeCalledTimes(1)
    })

    test('displays a proof request with one or more claims not available', async () => {
      const { agent } = useAgent()

      // @ts-ignore-next-line
      agent?.proofs.getFormatData.mockResolvedValue(testProofFormatData)

      // @ts-ignore-next-line
      agent?.proofs.getCredentialsForRequest.mockResolvedValue({
        proofFormats: {
          indy: {
            attributes: {
              ...testRetrievedCredentials.proofFormats.indy.attributes,
              time: [],
            },
            predicates: {},
          },
        },
      })
      const tree = render(
        <BasicAppContext>
          <ProofRequest navigation={useNavigation()} route={{ params: { proofId: testProofRequest.id } } as any} />
        </BasicAppContext>
      )

      await waitFor(() => {
        timeTravel(1000)
      })

      const cancelButton = tree.getByTestId(testIdWithKey('Cancel'))

      expect(cancelButton).not.toBeNull()
      expect(cancelButton).not.toBeDisabled()
    })

    test('displays a proof request with one or more predicates not satisfied', async () => {
      const { agent } = useAgent()

      // @ts-ignore-next-line
      agent?.proofs.getFormatData.mockResolvedValue(testProofFormatData)

      // @ts-ignore-next-line
      agent?.proofs.getCredentialsForRequest.mockResolvedValue({
        proofFormats: {
          indy: {
            attributes: testRetrievedCredentials.proofFormats.indy.attributes,
            predicates: {
              age: [
                {
                  credentialId: credentialId,
                  revealed: true,
                  credentialInfo: {
                    ...attributeBase,
                    credentialId: credentialId,
                    attributes: { age: 20 },
                  },
                },
              ],
            },
          },
        },
      })

      const { getByText, getByTestId } = render(
        <BasicAppContext>
          <ProofRequest navigation={useNavigation()} route={{ params: { proofId: testProofRequest.id } } as any} />
        </BasicAppContext>
      )

      await waitFor(() => {
        timeTravel(1000)
      })

      const predicateMessage = getByText('ProofRequest.YouDoNotHaveDataPredicate', { exact: false })
      const contact = getByText('ContactDetails.AContact', { exact: false })
      const emailLabel = getByText(/Email/, { exact: false })
      const emailValue = getByText(testEmail)
      const ageLabel = getByText(/Age/, { exact: false })
      const ageNotSatisfied = getByText('ProofRequest.PredicateNotSatisfied', { exact: false })
      const cancelButton = getByTestId(testIdWithKey('Cancel'))

      expect(predicateMessage).not.toBeNull()
      expect(predicateMessage).toBeTruthy()
      expect(contact).not.toBeNull()
      expect(contact).toBeTruthy()
      expect(emailLabel).not.toBeNull()
      expect(emailLabel).toBeTruthy()
      expect(emailValue).not.toBeNull()
      expect(emailValue).toBeTruthy()
      expect(ageLabel).not.toBeNull()
      expect(ageLabel).toBeTruthy()
      expect(ageNotSatisfied).not.toBeNull()
      expect(ageNotSatisfied).toBeTruthy()
      expect(cancelButton).not.toBeNull()
      expect(cancelButton).not.toBeDisabled()
    })
  })
})
