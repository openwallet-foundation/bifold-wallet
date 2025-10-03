import { AnonCredsProof, INDY_PROOF_REQUEST_ATTACHMENT_ID, DidCommRequestPresentationV1Message } from '@credo-ts/anoncreds'
import { DidCommProofExchangeRecord, DidCommProofRole, DidCommProofState, DidCommAttachment, DidCommAttachmentData } from '@credo-ts/didcomm'
import { useProofById } from '@credo-ts/react-hooks'
import * as verifier from '@bifold/verifier'
import mockRNCNetInfo from '@react-native-community/netinfo/jest/netinfo-mock'
import '@testing-library/jest-native'
import { RenderAPI, cleanup, fireEvent, render } from '@testing-library/react-native'
import React from 'react'
import { useNavigation as testUseNavigation } from '../../__mocks__/@react-navigation/native'
import ProofDetails from '../../src/screens/ProofDetails'
import { testIdWithKey } from '../../src/utils/testable'
import { BasicAppContext } from '../helpers/app'

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter')
jest.mock('@react-native-community/netinfo', () => mockRNCNetInfo)
jest.mock('@bifold/verifier', () => {
  const original = jest.requireActual('@bifold/verifier')
  return {
    ...original,
    __esModule: true,
    getProofData: jest.fn(original.getProofData),
  }
})
// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.mock('react-native-localize', () => {})
jest.useFakeTimers({ legacyFakeTimers: true })
jest.spyOn(global, 'setTimeout')

const proof_request = {
  name: 'proof-request',
  version: '1.0',
  nonce: '1298236324864',
  requested_attributes: {
    attribute_1: {
      names: ['first_name', 'second_name'],
    },
  },
  requested_predicates: {},
}

const proof: AnonCredsProof = {
  proof: {
    proofs: [],
    aggregated_proof: {
      c_list: [],
    },
  },
  requested_proof: {
    revealed_attrs: {},
    revealed_attr_groups: {
      attribute_1: {
        sub_proof_index: 0,
        values: {
          first_name: {
            raw: 'Aries',
            encoded: '',
          },
          second_name: {
            raw: 'Bifold',
            encoded: '',
          },
        },
      },
    },
    self_attested_attrs: {},
    unrevealed_attrs: {},
    predicates: {},
  },
  identifiers: [
    {
      schema_id: '7KuDTpQh3GJ7Gp6kErpWvM:2:Faber College:1.0.0',
      cred_def_id: '7KuDTpQh3GJ7Gp6kErpWvM:3:CL:712167:latest',
    },
    {
      schema_id: '7KuDTpQh3GJ7Gp6kErpWvM:2:Passport:1.0.0',
      cred_def_id: '7KuDTpQh3GJ7Gp6kErpWvM:3:CL:712168:latest',
    },
  ],
}

const requestPresentationMessage = new DidCommRequestPresentationV1Message({
  comment: 'some comment',
  requestAttachments: [
    new DidCommAttachment({
      id: INDY_PROOF_REQUEST_ATTACHMENT_ID,
      mimeType: 'application/json',
      data: new DidCommAttachmentData({
        json: proof_request,
      }),
    }),
  ],
})

const data = verifier.parseAnonCredsProof(proof_request, proof)

describe('ProofDetails Screen', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const renderView = (params?: { recordId: string; isHistory: boolean }) => {
    return render(
      <BasicAppContext>
        <ProofDetails navigation={testUseNavigation() as any} route={{ params } as any} />
      </BasicAppContext>
    )
  }

  describe('with a verified proof record', () => {
    const testVerifiedProofRequest = new DidCommProofExchangeRecord({
      role: DidCommProofRole.Prover,
      connectionId: undefined,
      threadId: requestPresentationMessage.id,
      state: DidCommProofState.Done,
      protocolVersion: 'V1',
      isVerified: true,
    })

    const checkAttributes = async (tree: RenderAPI) => {
      const firstNameAttribute = await tree.findByText('First Name', { exact: true })
      const firstNameAttributeValue = await tree.findByText('Aries', { exact: true })
      const secondNameAttribute = await tree.findByText('Second Name', { exact: true })
      const secondNameAttributeValue = await tree.findByText('Bifold', { exact: true })

      expect(firstNameAttribute).not.toBe(null)
      expect(firstNameAttributeValue).not.toBe(null)
      expect(secondNameAttribute).not.toBe(null)
      expect(secondNameAttributeValue).not.toBe(null)
    }

    beforeEach(() => {
      jest.clearAllMocks()

      // @ts-expect-error useProofById will be replaced with a mock which does have this method
      useProofById.mockReturnValue(testVerifiedProofRequest)
      jest.spyOn(verifier, 'getProofData').mockReturnValue(Promise.resolve(data))
    })

    test('renders correctly when history is true', async () => {
      const tree = renderView({ recordId: testVerifiedProofRequest.id, isHistory: true })

      const proofDetailsHistoryView = await tree.findByTestId(testIdWithKey('ProofDetailsHistoryView'))

      expect(tree).toMatchSnapshot()
      expect(proofDetailsHistoryView).not.toBe(null)

      await checkAttributes(tree)
    })

    test('renders correctly when history is false', async () => {
      const tree = renderView({ recordId: testVerifiedProofRequest.id, isHistory: false })

      const proofDetailsView = await tree.findByTestId(testIdWithKey('ProofDetailsView'))
      const generateNewButton = await tree.findByTestId(testIdWithKey('GenerateNewQR'))

      expect(tree).toMatchSnapshot()
      expect(proofDetailsView).not.toBe(null)
      expect(generateNewButton).not.toBe(null)

      await checkAttributes(tree)
    })

    test('Generate new QR code button should navigate correctly', async () => {
      const navigation = testUseNavigation() as any
      const tree = renderView({ recordId: testVerifiedProofRequest.id, isHistory: false })

      const generateNewButton = await tree.findByTestId(testIdWithKey('GenerateNewQR'))
      fireEvent(generateNewButton, 'press')

      expect(generateNewButton).not.toBeNull()
      expect(navigation.navigate).toBeCalledWith('Proof Requests', {})
    })

    test('Done', async () => {
      const navigation = testUseNavigation() as any
      const { findByTestId } = renderView({ recordId: testVerifiedProofRequest.id, isHistory: false })

      const doneButton = await findByTestId(testIdWithKey('BackToList'))
      fireEvent(doneButton, 'press')

      expect(doneButton).not.toBeNull()
      expect(navigation.navigate).toBeCalledWith('Proof Requests', {})
    })
  })

  describe('renders correctly with an unverified proof', () => {
    const testUnverifiedProofRequest = new DidCommProofExchangeRecord({
      connectionId: '123',
      threadId: requestPresentationMessage.id,
      state: DidCommProofState.Done,
      protocolVersion: 'V1',
      isVerified: false,
      role: DidCommProofRole.Verifier,
    })

    beforeEach(() => {
      jest.clearAllMocks()

      // @ts-expect-error useProofById will be replaced with a mock which does have this method
      useProofById.mockReturnValue(testUnverifiedProofRequest)
    })

    test('Unverified proof view should be rendered correctly', async () => {
      const tree = renderView({ recordId: testUnverifiedProofRequest.id, isHistory: false })

      const unverifiedView = await tree.findByTestId(testIdWithKey('UnverifiedProofView'))
      expect(tree).toMatchSnapshot()
      expect(unverifiedView).not.toBeNull()
    })
  })
})
