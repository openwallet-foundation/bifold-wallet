import { INDY_PROOF_REQUEST_ATTACHMENT_ID, V1RequestPresentationMessage } from '@credo-ts/anoncreds'
import {
  ConnectionRecord,
  DidExchangeRole,
  DidExchangeState,
  OutOfBandInvitation,
  ProofExchangeRecord,
  ProofRole,
  ProofState,
} from '@credo-ts/core'
import { Attachment, AttachmentData } from '@credo-ts/core/build/decorators/attachment/Attachment'
import { useConnections } from '@credo-ts/react-hooks'
import * as verifier from '@hyperledger/aries-bifold-verifier'
import { getProofRequestTemplates } from '@hyperledger/aries-bifold-verifier'
import mockRNCNetInfo from '@react-native-community/netinfo/jest/netinfo-mock'
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react-native'
import React from 'react'

import { useNavigation as testUseNavigation } from '../../__mocks__/@react-navigation/native'
import { testIdWithKey } from '../../src'
import * as proofRequestTemplatesHooks from '../../src/hooks/proof-request-templates'
import ProofRequesting from '../../src/screens/ProofRequesting'
import { BasicAppContext } from '../helpers/app'

jest.mock('@react-native-community/netinfo', () => mockRNCNetInfo)
jest.mock('@hyperledger/aries-bifold-verifier', () => {
  const original = jest.requireActual('@hyperledger/aries-bifold-verifier')
  return {
    ...original,
    __esModule: true,
    createConnectionlessProofRequestInvitation: jest.fn(original.createConnectionlessProofRequestInvitation),
  }
})
jest.mock('react-native-device-info', () => {
  return require('../../__mocks__/custom/react-native-device-info')
})

jest.useFakeTimers({ legacyFakeTimers: true })
jest.spyOn(global, 'setTimeout')

const templates = getProofRequestTemplates(true)
const template = templates[0]
const templateId = template.id

const proof_request = {
  name: 'proof-request',
  version: '1.0',
  nonce: '1298236324864',
  requested_attributes: {
    attribute_1: {
      names: ['first_name', 'second_name'],
    },
  },
}

const requestPresentationMessage = new V1RequestPresentationMessage({
  comment: 'some comment',
  requestAttachments: [
    new Attachment({
      id: INDY_PROOF_REQUEST_ATTACHMENT_ID,
      mimeType: 'application/json',
      data: new AttachmentData({
        json: proof_request,
      }),
    }),
  ],
})
const proofRecord = new ProofExchangeRecord({
  connectionId: undefined,
  threadId: requestPresentationMessage.id,
  state: ProofState.RequestSent,
  protocolVersion: 'V1',
  isVerified: true,
  role: ProofRole.Prover,
})
const invitation = new OutOfBandInvitation({
  id: 'test',
  label: 'Test Invitation',
  services: [],
})
const invitationUrl = 'http://example.com/ssi?oob=eyJ'

const data = {
  request: requestPresentationMessage,
  proofRecord,
  invitation,
  invitationUrl,
}

describe('ProofRequesting Component', () => {
  const testContactRecord1 = new ConnectionRecord({
    id: '1',
    did: '9gtPKWtaUKxJir5YG2VPxX',
    theirLabel: 'Faber',
    role: DidExchangeRole.Responder,
    theirDid: '2SBuq9fpLT8qUiQKr2RgBe',
    threadId: '1',
    state: DidExchangeState.Completed,
    createdAt: new Date('2020-01-01T00:00:00.000Z'),
  })
  const testContactRecord2 = new ConnectionRecord({
    id: '2',
    did: '2SBuq9fpLT8qUiQKr2RgBe',
    role: DidExchangeRole.Requester,
    theirLabel: 'Bob',
    theirDid: '9gtPKWtaUKxJir5YG2VPxX',
    threadId: '1',
    state: DidExchangeState.Completed,
    createdAt: new Date('2020-01-01T00:00:00.000Z'),
  })
  afterEach(() => {
    cleanup()
  })
  beforeEach(() => {
    jest.clearAllMocks()

    // @ts-expect-error useConnections will be replaced with a mock which does have this method
    useConnections.mockReturnValue({ records: [testContactRecord1, testContactRecord2] })
    jest.spyOn(verifier, 'createConnectionlessProofRequestInvitation').mockReturnValue(Promise.resolve(data))
    jest.spyOn(proofRequestTemplatesHooks, 'useTemplate').mockReturnValue(template)
  })

  const renderView = (params?: { templateId: string; predicateValues: any }) => {
    return render(
      <BasicAppContext>
        <ProofRequesting navigation={testUseNavigation() as any} route={{ params } as any} />
      </BasicAppContext>
    )
  }

  test('renders correctly', async () => {
    const tree = renderView({ templateId, predicateValues: {} })

    await waitFor(
      () => {
        expect(tree.getByTestId(testIdWithKey('LoadingActivityIndicator'))).toBeDefined()
        expect(tree).toMatchSnapshot()
      },
      { timeout: 50000 }
    )

    await act(async () => {})
    expect(tree).toMatchSnapshot()
  })

  test('generate new qr works correctly', async () => {
    const tree = renderView({ templateId, predicateValues: {} })

    const generateQRButton = tree.getByTestId(testIdWithKey('GenerateNewQR'))
    expect(generateQRButton).not.toBeNull()
    fireEvent(generateQRButton, 'press')

    await waitFor(
      () => {
        expect(tree.getByTestId(testIdWithKey('LoadingActivityIndicator'))).toBeDefined()
        expect(tree).toMatchSnapshot()
      },
      { timeout: 50000 }
    )
  })
})
