import { getCredentialsForAnonCredsProofRequest } from '@credo-ts/anoncreds'
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
import { useNavigation } from '@react-navigation/core'
import '@testing-library/jest-native/extend-expect'
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react-native'
import React from 'react'

import { AnonCredsCredentialsForProofRequest } from '@credo-ts/anoncreds'
import { useTranslation } from 'react-i18next'
import { ConfigurationContext } from '../../App/contexts/configuration'
import { NetworkContext, NetworkProvider } from '../../App/contexts/network'
import ProofRequest from '../../App/screens/ProofRequest'
import { testIdWithKey } from '../../App/utils/testable'
import configurationContext from '../contexts/configuration'
import networkContext from '../contexts/network'
import timeTravel from '../helpers/timetravel'
import {
  anonCredsCredentialsForProofRequest,
  difPexCredentialsForRequest,
  difPexCredentialsForRequest2,
  testPresentationDefinition1,
  testW3cCredentialRecord,
} from './fixtures/w3c-proof-request'

jest.mock("../../App/container-api", ()=>{
  return require("../../__mocks__/custom/container-api")
});
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
  describe('with a proof request', () => {
    const testEmail = 'test@email.com'
    const testTime = '2022-02-11 20:00:18.180718'
    const testAge = '16'

    const { t } = useTranslation()

    const { id: credentialId } = new CredentialExchangeRecord({
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

      const cancelButton = tree.getByTestId(testIdWithKey('Cancel'))
      const recordLoading = tree.getByTestId(testIdWithKey('RecordLoading'))

      expect(recordLoading).not.toBeNull()
      expect(cancelButton).not.toBeNull()
      expect(cancelButton).not.toBeDisabled()
    })

    test('displays a proof request with all claims available', async () => {
      const { agent } = useAgent()

      // @ts-ignore-next-line
      agent?.proofs.getFormatData.mockResolvedValue({
        request: { presentationExchange: { presentation_definition: testPresentationDefinition1 } },
      })

      // @ts-ignore-next-line
      agent?.proofs.getCredentialsForRequest.mockResolvedValue({
        proofFormats: { presentationExchange: difPexCredentialsForRequest },
      })

      // @ts-ignore-next-line
      getCredentialsForAnonCredsProofRequest.mockResolvedValue(anonCredsCredentialsForProofRequest)

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

    test('displays a proof request with multiple satisfying credentials', async () => {
      const { agent } = useAgent()
      const testEmail2 = 'test2@email.com'
      const testTime2 = '2023-02-11 20:00:18.180718'
      const testAge2 = '17'

      const { id: credentialId2 } = new CredentialExchangeRecord({
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

      // @ts-ignore-next-line
      agent?.proofs.getFormatData.mockResolvedValue({
        request: { presentationExchange: { presentation_definition: testPresentationDefinition1 } },
      })

      // @ts-ignore-next-line
      agent?.proofs.getCredentialsForRequest.mockResolvedValue({
        proofFormats: { presentationExchange: difPexCredentialsForRequest2 },
      })

      // @ts-ignore-next-line
      getCredentialsForAnonCredsProofRequest.mockResolvedValue(testRetrievedCredentials2.proofFormats.indy)

      const navigation = useNavigation()

      const { getByText, getByTestId, queryByText } = render(
        <ConfigurationContext.Provider value={configurationContext}>
          <NetworkProvider>
            <ProofRequest navigation={navigation as any} route={{ params: { proofId: testProofRequest.id } } as any} />
          </NetworkProvider>
        </ConfigurationContext.Provider>
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
      agent?.proofs.getFormatData.mockResolvedValue({
        request: { presentationExchange: { presentation_definition: testPresentationDefinition1 } },
      })

      // @ts-ignore-next-line
      agent?.proofs.getCredentialsForRequest.mockResolvedValue({
        proofFormats: { presentationExchange: difPexCredentialsForRequest },
      })

      // @ts-ignore-next-line
      getCredentialsForAnonCredsProofRequest.mockResolvedValue(anonCredsCredentialsForProofRequest)

      const credentialsForRequest: AnonCredsCredentialsForProofRequest = {
        ...anonCredsCredentialsForProofRequest,
        attributes: {
          ...anonCredsCredentialsForProofRequest.attributes,
          time: [],
        },
        predicates: {},
      }

      // @ts-ignore-next-line
      getCredentialsForAnonCredsProofRequest.mockResolvedValue(credentialsForRequest)

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

      const cancelButton = tree.getByTestId(testIdWithKey('Cancel'))

      expect(cancelButton).not.toBeNull()
      expect(cancelButton).not.toBeDisabled()
    })

    test('displays a proof request with one or more predicates not satisfied', async () => {
      const { agent } = useAgent()

      // @ts-ignore-next-line
      agent?.proofs.getFormatData.mockResolvedValue({
        request: { presentationExchange: { presentation_definition: testPresentationDefinition1 } },
      })

      // @ts-ignore-next-line
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

      // @ts-ignore-next-line
      getCredentialsForAnonCredsProofRequest.mockResolvedValue(anonCredsCredentialsForProofRequest)

      // @ts-ignore-next-line
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
      const ageValue = getByText(t('ProofRequest.PredicateLe') + ' 18')
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
      expect(ageValue).not.toBeNull()
      expect(ageValue).toBeTruthy()
      expect(ageNotSatisfied).not.toBeNull()
      expect(ageNotSatisfied).toBeTruthy()
      expect(cancelButton).not.toBeNull()
      expect(cancelButton).not.toBeDisabled()
    })
  })
})
