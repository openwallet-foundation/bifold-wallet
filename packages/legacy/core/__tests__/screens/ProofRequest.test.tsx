import {
  CredentialExchangeRecord,
  CredentialState,
  IndyCredentialInfo,
  INDY_PROOF_REQUEST_ATTACHMENT_ID,
  ProofExchangeRecord,
  ProofState,
  RequestedAttribute,
  V1RequestPresentationMessage,
} from '@aries-framework/core'
import { Attachment, AttachmentData } from '@aries-framework/core/build/decorators/attachment/Attachment'
import { useAgent, useProofById } from '@aries-framework/react-hooks'
import mockRNCNetInfo from '@react-native-community/netinfo/jest/netinfo-mock'
import { useNavigation } from '@react-navigation/core'
import '@testing-library/jest-native/extend-expect'
import { cleanup, render, waitFor } from '@testing-library/react-native'
import React from 'react'

import { NetworkContext, NetworkProvider } from '../../App/contexts/network'
import ProofRequest from '../../App/screens/ProofRequest'
import { testIdWithKey } from '../../App/utils/testable'
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
   * AND a link to the details of the credential
   * AND there is a "Decline" Button
   * AND there is a "Share" Button
   */
  describe('with a proof request', () => {
    const testEmail = 'test@email.com'
    const testTime = '2022-02-11 20:00:18.180718'

    const testCredentials = [
      new CredentialExchangeRecord({
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
        ],
        protocolVersion: 'v1',
      }),
    ]

    const requestPresentationMessage = new V1RequestPresentationMessage({
      comment: 'some comment',
      requestPresentationAttachments: [
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
                  names: ['time'],
                },
              },
              requestedPredicates: {},
            },
          }),
        }),
      ],
    })

    const testProofRequest = new ProofExchangeRecord({
      connectionId: '123',
      threadId: requestPresentationMessage.id,
      state: ProofState.RequestReceived,
      protocolVersion: 'V1',
    })

    const attributeBase = {
      referent: '',
      schemaId: '',
      credentialDefinitionId: '',
      toJSON: jest.fn(),
    }

    const testRetrievedCredentials = {
      requestedAttributes: {
        email: [
          new RequestedAttribute({
            credentialId: testCredentials[0].id,
            revealed: true,
            credentialInfo: new IndyCredentialInfo({
              ...attributeBase,
              attributes: { email: testEmail },
            }),
          }),
        ],
        time: [
          new RequestedAttribute({
            credentialId: testCredentials[0].id,
            revealed: true,
            credentialInfo: new IndyCredentialInfo({
              ...attributeBase,
              attributes: { time: testTime },
            }),
          }),
        ],
      },
    }

    beforeEach(() => {
      jest.clearAllMocks()

      // @ts-ignore
      useProofById.mockReturnValue(testProofRequest)
    })

    test('loading screen displays', async () => {
      const tree = render(
        <NetworkProvider>
          <ProofRequest navigation={useNavigation()} route={{ params: { proofId: testProofRequest.id } } as any} />
        </NetworkProvider>
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

    test.skip('displays a proof request with all claims available', async () => {
      const { agent } = useAgent()

      // @ts-ignore
      agent?.proofs.getRequestedCredentialsForProofRequest.mockResolvedValue(testRetrievedCredentials)

      const { getByText, getAllByText, queryByText } = render(
        <NetworkProvider>
          <ProofRequest navigation={useNavigation()} route={{ params: { proofId: testProofRequest.id } } as any} />
        </NetworkProvider>
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
      const detailsLinks = getAllByText('ProofRequest.Details', { exact: false })
      const shareButton = getByText('Global.Share', { exact: false })
      const declineButton = getByText('Global.Decline', { exact: false })

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
      expect(detailsLinks.length).toBe(2)
      expect(shareButton).not.toBeNull()
      expect(declineButton).not.toBeNull()
    })

    test('displays a proof request with one or more claims not available', async () => {
      const { agent } = useAgent()

      // @ts-ignore
      agent?.proofs.getRequestedCredentialsForProofRequest.mockResolvedValue({
        requestedAttributes: { ...testRetrievedCredentials.requestedAttributes, time: [] },
      })

      const tree = render(
        <NetworkContext.Provider value={networkContext}>
          <ProofRequest navigation={useNavigation()} route={{ params: { proofId: testProofRequest.id } } as any} />
        </NetworkContext.Provider>
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
  })
})
