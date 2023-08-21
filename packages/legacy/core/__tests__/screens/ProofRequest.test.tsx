import { INDY_PROOF_REQUEST_ATTACHMENT_ID, V1RequestPresentationMessage } from '@aries-framework/anoncreds'
import { CredentialExchangeRecord, CredentialState, ProofExchangeRecord, ProofState } from '@aries-framework/core'
import { Attachment, AttachmentData } from '@aries-framework/core/build/decorators/attachment/Attachment'
import { useAgent, useProofById } from '@aries-framework/react-hooks'
import mockRNCNetInfo from '@react-native-community/netinfo/jest/netinfo-mock'
import { useNavigation } from '@react-navigation/core'
import '@testing-library/jest-native/extend-expect'
import { cleanup, render, waitFor } from '@testing-library/react-native'
import React from 'react'

import { ConfigurationContext } from '../../App/contexts/configuration'
import { NetworkContext, NetworkProvider } from '../../App/contexts/network'
import ProofRequest from '../../App/screens/ProofRequest'
import { testIdWithKey } from '../../App/utils/testable'
import configurationContext from '../contexts/configuration'
import networkContext from '../contexts/network'
import timeTravel from '../helpers/timetravel'

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter')
jest.mock('@react-native-community/netinfo', () => mockRNCNetInfo)
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')
jest.mock('@react-navigation/core', () => {
  return require('../../__mocks__/custom/@react-navigation/core')
})
jest.mock('@react-navigation/native', () => {
  return require('../../__mocks__/custom/@react-navigation/native')
})

jest.mock('@hyperledger/anoncreds-react-native', () => ({}))
jest.mock('@hyperledger/aries-askar-react-native', () => ({}))
jest.mock('@hyperledger/indy-vdr-react-native', () => ({}))
jest.useFakeTimers('legacy')
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

    const { id: credentialId } = new CredentialExchangeRecord({
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
      connectionId: '',
      threadId: presentationMessageId,
      state: ProofState.RequestReceived,
      protocolVersion: 'V1',
    })

    const attributeBase = {
      referent: '',
      schemaId: '',
      credentialDefinitionId: 'AAAAAAAAAAAAAAAAAAAAAA:1:AA:1234:test',
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
            additionalProp2: {
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

      // @ts-ignore-next-line
      useProofById.mockReturnValue(testProofRequest)
    })

    test('loading screen displays', async () => {
      const tree = render(
        <ConfigurationContext.Provider value={configurationContext}>
          <NetworkProvider>
            <ProofRequest navigation={useNavigation()} route={{ params: { proofId: testProofRequest.id } } as any} />
          </NetworkProvider>
        </ConfigurationContext.Provider>
      )

      await waitFor(() => {
        timeTravel(1000)
      })

      const shareButton = tree.getByTestId(testIdWithKey('Share'))
      const declineButton = tree.getByTestId(testIdWithKey('Decline'))
      const recordLoading = tree.getByTestId(testIdWithKey('RecordLoading'))

      expect(recordLoading).not.toBeNull()
      expect(shareButton).not.toBeNull()
      expect(shareButton).toBeDisabled()
      expect(declineButton).not.toBeNull()
      expect(declineButton).not.toBeDisabled()
    })

    test('displays a proof request with all claims available', async () => {
      const { agent } = useAgent()

      // @ts-ignore-next-line
      agent?.proofs.getFormatData.mockResolvedValue(testProofFormatData)

      // @ts-ignore-next-line
      agent?.proofs.getCredentialsForRequest.mockResolvedValue(testRetrievedCredentials)

      const { getByText, getByTestId, queryByText } = render(
        <ConfigurationContext.Provider value={configurationContext}>
          <NetworkProvider>
            <ProofRequest navigation={useNavigation()} route={{ params: { proofId: testProofRequest.id } } as any} />
          </NetworkProvider>
        </ConfigurationContext.Provider>
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
        <ConfigurationContext.Provider value={configurationContext}>
          <NetworkContext.Provider value={networkContext}>
            <ProofRequest navigation={useNavigation()} route={{ params: { proofId: testProofRequest.id } } as any} />
          </NetworkContext.Provider>
        </ConfigurationContext.Provider>
      )

      await waitFor(() => {
        timeTravel(1000)
      })

      const shareButton = tree.getByTestId(testIdWithKey('Share'))
      const declineButton = tree.getByTestId(testIdWithKey('Decline'))

      expect(shareButton).not.toBeNull()
      expect(shareButton).toBeDisabled()
      expect(declineButton).not.toBeNull()
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
        <ConfigurationContext.Provider value={configurationContext}>
          <NetworkContext.Provider value={networkContext}>
            <ProofRequest navigation={useNavigation()} route={{ params: { proofId: testProofRequest.id } } as any} />
          </NetworkContext.Provider>
        </ConfigurationContext.Provider>
      )

      await waitFor(() => {
        timeTravel(1000)
      })

      const predicateMessage = getByText('ProofRequest.YouDoNotHaveDataPredicate', { exact: false })
      const contact = getByText('ContactDetails.AContact', { exact: false })
      const emailLabel = getByText(/Email/, { exact: false })
      const emailValue = getByText(testEmail)
      const ageLabel = getByText(/Age/, { exact: false })
      const ageValue = getByText('<= 18')
      const ageNotSatisfied = getByText('ProofRequest.PredicateNotSatisfied', { exact: false })
      const shareButton = getByTestId(testIdWithKey('Share'))
      const declineButton = getByTestId(testIdWithKey('Decline'))

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
      expect(ageValue).not.toBeNull()
      expect(ageValue).toBeTruthy()
      expect(ageNotSatisfied).not.toBeNull()
      expect(ageNotSatisfied).toBeTruthy()
      expect(shareButton).not.toBeNull()
      expect(shareButton).toBeDisabled()
      expect(declineButton).not.toBeNull()
    })
  })
})
