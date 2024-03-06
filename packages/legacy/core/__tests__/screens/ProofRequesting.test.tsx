import mockRNCNetInfo from '@react-native-community/netinfo/jest/netinfo-mock'
import { useConnections } from '@aries-framework/react-hooks'
import { useNavigation } from '@react-navigation/core'
import { act, cleanup, render, fireEvent, waitFor } from '@testing-library/react-native'
import React from 'react'

import * as verifier from '@hyperledger/aries-bifold-verifier'
import { useProofRequestTemplates } from '@hyperledger/aries-bifold-verifier'
import { testIdWithKey } from '../../App'
import ProofRequesting from '../../App/screens/ProofRequesting'

import * as proofRequestTemplatesHooks from '../../App/hooks/proof-request-templates'
import {
  ConnectionRecord,
  DidExchangeRole,
  DidExchangeState,
  OutOfBandInvitation,
  ProofExchangeRecord,
  ProofState,
} from '@aries-framework/core'
import { V1RequestPresentationMessage, INDY_PROOF_REQUEST_ATTACHMENT_ID } from '@aries-framework/anoncreds'
import { Attachment, AttachmentData } from '@aries-framework/core/build/decorators/attachment/Attachment'

jest.mock('react-native-permissions', () => require('react-native-permissions/mock'))
jest.mock('@react-native-community/netinfo', () => mockRNCNetInfo)
jest.mock('@hyperledger/anoncreds-react-native', () => ({}))
jest.mock('@hyperledger/aries-askar-react-native', () => ({}))
jest.mock('react-native-fs', () => ({}))
jest.mock('@hyperledger/indy-vdr-react-native', () => ({}))
jest.mock('@react-navigation/core', () => {
  return require('../../__mocks__/custom/@react-navigation/core')
})
jest.mock('@react-navigation/native', () => {
  return require('../../__mocks__/custom/@react-navigation/native')
})
jest.mock('@hyperledger/aries-bifold-verifier',() => {
  const original = jest. requireActual('@hyperledger/aries-bifold-verifier')
  return {
    ...original,
     __esModule: true,
     createConnectionlessProofRequestInvitation: jest.fn(original.createConnectionlessProofRequestInvitation)
  }
})
jest.mock('react-native-device-info', () => {
  return require('../../__mocks__/custom/react-native-device-info')
})
jest.mock('react-native-vision-camera', () => {
  return require('../../__mocks__/custom/react-native-camera')
})

jest.useFakeTimers({ legacyFakeTimers: true })
jest.spyOn(global, 'setTimeout')

const templates = useProofRequestTemplates(true)
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

    // @ts-ignore
    useConnections.mockReturnValue({ records: [testContactRecord1, testContactRecord2] })
    jest.spyOn(verifier, 'createConnectionlessProofRequestInvitation').mockReturnValue(Promise.resolve(data))
    jest.spyOn(proofRequestTemplatesHooks, 'useTemplate').mockReturnValue(template)
  })

  const renderView = (params?: { templateId: string; predicateValues: any }) => {
    return render(<ProofRequesting navigation={useNavigation()} route={{ params } as any} />)
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
