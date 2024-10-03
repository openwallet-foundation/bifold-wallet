import { AnonCredsCredentialsForProofRequest, getCredentialsForAnonCredsProofRequest } from '@credo-ts/anoncreds'
import {
  ClaimFormat,
  CredentialExchangeRecord,
  CredentialRole,
  CredentialState,
  ProofExchangeRecord,
  ProofRole,
  ProofState,
} from '@credo-ts/core'
import { useAgent, useProofById } from '@credo-ts/react-hooks'
import mockRNCNetInfo from '@react-native-community/netinfo/jest/netinfo-mock'
import { useNavigation } from '@react-navigation/native'
import '@testing-library/jest-native/extend-expect'
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react-native'
import React from 'react'

import ProofRequest from '../../App/screens/ProofRequest'
import { testIdWithKey } from '../../App/utils/testable'
import timeTravel from '../helpers/timetravel'

import {
  anonCredsCredentialsForProofRequest,
  difPexCredentialsForRequest,
  difPexCredentialsForRequest2,
  testPresentationDefinition1,
  testW3cCredentialRecord,
} from './fixtures/w3c-proof-request'
import { useCredentials } from '../../__mocks__/@credo-ts/react-hooks'
import { BasicAppContext } from '../helpers/app'

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter')
jest.mock('@react-native-community/netinfo', () => mockRNCNetInfo)
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')
jest.mock('@credo-ts/anoncreds', () => {
  return {
    ...jest.requireActual('@credo-ts/anoncreds'),
    getCredentialsForAnonCredsProofRequest: jest.fn(),
  }
})
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
  describe('ProofRequest Screen, W3C', () => {
    const testEmail = 'test@email.com'
    const testTime = '2022-02-11 20:00:18.180718'
    const testAge = '16'

    const credExRecord = new CredentialExchangeRecord({
      createdAt: new Date('2024-02-11 20:00:18.180718'),
      id: '8eba4449-8a85-4954-b11c-e0590f39cbdb',
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

    const testProofRequest = new ProofExchangeRecord({
      connectionId: '',
      state: ProofState.RequestReceived,
      role: ProofRole.Prover,
      threadId: '4f5659a4-1aea-4f42-8c22-9a9985b35e38',
      protocolVersion: 'v1',
    })

    const attributeBase = {
      referent: '',
      schemaId: '',
      credentialDefinitionId: 'did:indy:bcovrin:test:TfuPA6whW681GfU6fj1e3k/anoncreds/v0/CLAIM_DEF/462230/latest',
      toJSON: jest.fn(),
    }

    beforeEach(() => {
      jest.clearAllMocks()
      useCredentials.mockReturnValue({ records: [credExRecord] })
      // @ts-expect-error useProofById will be replaced with a mock which does have this method
      useProofById.mockReturnValue(testProofRequest)
    })

    test('loading screen displays', async () => {
      const tree = render(
        <BasicAppContext>
          <ProofRequest navigation={useNavigation()} proofId={testProofRequest.id} />
        </BasicAppContext>
      )

      await waitFor(() => {
        timeTravel(1000)
      })

      const cancelButton = tree.getByTestId(testIdWithKey('Cancel'))
      const recordLoading = tree.getByTestId(testIdWithKey('ProofRequestLoading'))

      expect(recordLoading).not.toBeNull()
      expect(cancelButton).not.toBeNull()
      expect(cancelButton).not.toBeDisabled()
    })

    test('displays a proof request with all claims available', async () => {
      const { agent } = useAgent()

      // @ts-expect-error this method will be replaced with a mock which does have this method
      agent?.proofs.getFormatData.mockResolvedValue({
        request: { presentationExchange: { presentation_definition: testPresentationDefinition1 } },
      })

      // @ts-expect-error this method will be replaced with a mock which does have this method
      agent?.proofs.getCredentialsForRequest.mockResolvedValue({
        proofFormats: { presentationExchange: difPexCredentialsForRequest },
      })

      // @ts-expect-error this method will be replaced with a mock which does have this method
      getCredentialsForAnonCredsProofRequest.mockResolvedValue(anonCredsCredentialsForProofRequest)

      const { getByText, getByTestId, queryByText } = render(
        <BasicAppContext>
          <ProofRequest navigation={useNavigation()} proofId={testProofRequest.id} />
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
        createdAt: new Date('2024-02-11 20:00:18.180718'),
        id: '8eba4449-8a85-4954-b11c-e0590f39cbdc',
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
              age_0: [
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

      // @ts-expect-error this method will be replaced with a mock which does have this method
      agent?.proofs.getFormatData.mockResolvedValue({
        request: { presentationExchange: { presentation_definition: testPresentationDefinition1 } },
      })

      // @ts-expect-error this method will be replaced with a mock which does have this method
      agent?.proofs.getCredentialsForRequest.mockResolvedValue({
        proofFormats: { presentationExchange: difPexCredentialsForRequest2 },
      })

      // @ts-expect-error this method will be replaced with a mock which does have this method
      getCredentialsForAnonCredsProofRequest.mockResolvedValue(testRetrievedCredentials2.proofFormats.indy)

      const navigation = useNavigation()

      const { getByText, getByTestId, queryByText } = render(
        <BasicAppContext>
          <ProofRequest navigation={navigation as any} proofId={testProofRequest.id} />
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

      // @ts-expect-error this method will be replaced with a mock which does have this method
      agent?.proofs.getFormatData.mockResolvedValue({
        request: { presentationExchange: { presentation_definition: testPresentationDefinition1 } },
      })

      // @ts-expect-error this method will be replaced with a mock which does have this method
      agent?.proofs.getCredentialsForRequest.mockResolvedValue({
        proofFormats: { presentationExchange: difPexCredentialsForRequest },
      })

      // @ts-expect-error this method will be replaced with a mock which does have this method
      getCredentialsForAnonCredsProofRequest.mockResolvedValue(anonCredsCredentialsForProofRequest)

      const credentialsForRequest: AnonCredsCredentialsForProofRequest = {
        ...anonCredsCredentialsForProofRequest,
        attributes: {
          ...anonCredsCredentialsForProofRequest.attributes,
          time: [],
        },
        predicates: {},
      }

      // @ts-expect-error this method will be replaced with a mock which does have this method
      getCredentialsForAnonCredsProofRequest.mockResolvedValue(credentialsForRequest)

      const tree = render(
        <BasicAppContext>
          <ProofRequest navigation={useNavigation()} proofId={testProofRequest.id} />
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

      // @ts-expect-error this method will be replaced with a mock which does have this method
      agent?.proofs.getFormatData.mockResolvedValue({
        request: { presentationExchange: { presentation_definition: testPresentationDefinition1 } },
      })

      // @ts-expect-error this method will be replaced with a mock which does have this method
      agent?.proofs.getCredentialsForRequest.mockResolvedValue({
        proofFormats: {
          presentationExchange: {
            requirements: [
              {
                rule: 'pick',
                needsCount: 1,
                submissionEntry: [
                  {
                    inputDescriptorId: 'age',
                    name: undefined,
                    purpose: undefined,
                    verifiableCredentials: [],
                  },
                ],
                isRequirementSatisfied: false,
              },
              {
                rule: 'pick',
                needsCount: 1,
                submissionEntry: [
                  {
                    inputDescriptorId: 'email',
                    name: undefined,
                    purpose: undefined,
                    verifiableCredentials: [{ type: ClaimFormat.LdpVc, credentialRecord: testW3cCredentialRecord }],
                  },
                ],
                isRequirementSatisfied: true,
              },
              {
                rule: 'pick',
                needsCount: 1,
                submissionEntry: [
                  {
                    inputDescriptorId: 'time',
                    name: undefined,
                    purpose: undefined,
                    verifiableCredentials: [{ type: ClaimFormat.LdpVc, credentialRecord: testW3cCredentialRecord }],
                  },
                ],
                isRequirementSatisfied: true,
              },
            ],
          },
        },
      })

      // @ts-expect-error this method will be replaced with a mock which does have this method
      getCredentialsForAnonCredsProofRequest.mockResolvedValue({
        attributes: anonCredsCredentialsForProofRequest.attributes,
        predicates: {
          age_0: [
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
      })

      const tree = render(
        <BasicAppContext>
          <ProofRequest navigation={useNavigation()} proofId={testProofRequest.id} />
        </BasicAppContext>
      )

      await waitFor(() => {
        timeTravel(1000)
      })

      expect(tree).toMatchSnapshot()
    })
  })
})
