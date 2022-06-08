import {
  CredentialRecord,
  CredentialState,
  IndyCredentialInfo,
  INDY_PROOF_REQUEST_ATTACHMENT_ID,
  ProofRecord,
  ProofState,
  RequestedAttribute,
  RequestPresentationMessage,
} from '@aries-framework/core'
import { Attachment, AttachmentData } from '@aries-framework/core/build/decorators/attachment/Attachment'
import { useAgent, useProofById } from '@aries-framework/react-hooks'
import { useNavigation } from '@react-navigation/core'
import { cleanup, render, waitFor } from '@testing-library/react-native'
import React from 'react'
import timeTravel from '../util/timetravel'
import { testIdWithKey } from '../../App/utils/testable'

import ProofRequest from '../../App/screens/ProofRequest'

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
      new CredentialRecord({
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
      }),
    ]

    const requestPresentationMessage = new RequestPresentationMessage({
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

    const testProofRequest = new ProofRecord({
      connectionId: '123',
      threadId: requestPresentationMessage.id,
      requestMessage: requestPresentationMessage,
      state: ProofState.RequestReceived,
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
      // const { agent } = useAgent()

      // // @ts-ignore
      // agent?.proofs.getRequestedCredentialsForProofRequest.mockResolvedValue({
      //   requestedAttributes: { ...testRetrievedCredentials.requestedAttributes, time: [] },
      // })

      const tree = render(
        <ProofRequest navigation={useNavigation()} route={{ params: { proofId: testProofRequest.id } } as any} />
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

      // @ts-ignore
      agent?.proofs.getRequestedCredentialsForProofRequest.mockResolvedValue(testRetrievedCredentials)

      const { getByText, getAllByText, queryByText } = render(
        <ProofRequest navigation={useNavigation()} route={{ params: { proofId: testProofRequest.id } } as any} />
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

    test.skip('displays a proof request with one or more claims not available', async () => {
      const { agent } = useAgent()

      // @ts-ignore
      agent?.proofs.getRequestedCredentialsForProofRequest.mockResolvedValue({
        requestedAttributes: { ...testRetrievedCredentials.requestedAttributes, time: [] },
      })

      const tree = render(
        <ProofRequest navigation={useNavigation()} route={{ params: { proofId: testProofRequest.id } } as any} />
      )

      await waitFor(() => {
        timeTravel(1000)
      })

      // const contact = getByText('ContactDetails.AContact', { exact: false })
      // const missingInfo = getByText('ProofRequest.IsRequestingSomethingYouDontHaveAvailable', { exact: false })
      // const missingClaim = queryByText('ProofRequest.NotAvailableInYourWallet', { exact: false })
      // const emailLabel = getByText(/Email/, { exact: false })
      // const emailValue = getByText(testEmail)
      // const timeLabel = getByText(/Time/, { exact: false })
      // const timeValue = queryByText(testTime, { exact: false })
      // const detailsLinks = getAllByText('ProofRequest.Details', { exact: false })
      // const shareButton = queryByText('Global.Share', { exact: false })
      // const declineButton = getByText('Global.Decline', { exact: false })
      const shareButton = tree.getByTestId(testIdWithKey('Share'))
      const declineButton = tree.getByTestId(testIdWithKey('Decline'))
      // const recordLoading = tree.getByTestId(testIdWithKey('RecordLoading'))

      // expect(tree).toMatchSnapshot()

      // expect(contact).not.toBeNull()
      // expect(contact).toBeTruthy()
      // expect(missingInfo).not.toBeNull()
      // expect(missingInfo).toBeTruthy()
      // expect(emailLabel).not.toBeNull()
      // expect(emailLabel).toBeTruthy()
      // expect(emailValue).not.toBeNull()
      // expect(emailValue).toBeTruthy()
      // expect(timeLabel).not.toBeNull()
      // expect(timeLabel).toBeTruthy()
      // expect(timeValue).toBeNull()
      // expect(missingClaim).not.toBeNull()
      // expect(missingClaim).toBeTruthy()
      // expect(detailsLinks.length).toBe(1)
      // expect(recordLoading).not.toBeNull()
      expect(shareButton).not.toBeNull()
      expect(shareButton).toBeDisabled()
      expect(declineButton).not.toBeNull()
    })
  })
})
