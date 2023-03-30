import {
  INDY_PROOF_REQUEST_ATTACHMENT_ID,
  ProofExchangeRecord,
  ProofState,
  V1RequestPresentationMessage,
} from '@aries-framework/core'
import { Attachment, AttachmentData } from '@aries-framework/core/build/decorators/attachment/Attachment'
import { useProofById } from '@aries-framework/react-hooks'
import mockRNCNetInfo from '@react-native-community/netinfo/jest/netinfo-mock'
import { useNavigation } from '@react-navigation/core'
import '@testing-library/jest-native/extend-expect'
import { act, cleanup, fireEvent, render, RenderAPI } from '@testing-library/react-native'
import React from 'react'

import { testIdWithKey } from '../../App/utils/testable'
import ProofDetails from '../../App/screens/ProofDetails'
import * as proofUtils from '../../verifier/utils/proof'
import { IndyProof } from 'indy-sdk-react-native'
import configurationContext from '../contexts/configuration'
import { NetworkProvider } from '../../App/contexts/network'
import { ConfigurationContext } from '../../App/contexts/configuration'

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter')
jest.mock('@react-native-community/netinfo', () => mockRNCNetInfo)
jest.mock('@react-navigation/core', () => {
  return require('../../__mocks__/custom/@react-navigation/core')
})
jest.mock('@react-navigation/native', () => {
  return require('../../__mocks__/custom/@react-navigation/native')
})
// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.mock('react-native-localize', () => {})
jest.useFakeTimers('legacy')
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

const proof: IndyProof = {
  proof: {
    proofs: [],
    aggregated_proof: {
      c_list: [],
    },
  },
  requested_proof: {
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
    // @ts-ignore
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

const requestPresentationMessage = new V1RequestPresentationMessage({
  comment: 'some comment',
  requestPresentationAttachments: [
    new Attachment({
      id: INDY_PROOF_REQUEST_ATTACHMENT_ID,
      mimeType: 'application/json',
      data: new AttachmentData({
        json: proof_request,
      }),
    }),
  ],
})

const data = proofUtils.parseIndyProof(proof_request, proof)

describe('ProofDetails Component', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const renderView = (params?: { recordId: string; isHistory: boolean }) => {
    return render(
      <ConfigurationContext.Provider value={configurationContext}>
        <NetworkProvider>
          <ProofDetails navigation={useNavigation()} route={{ params } as any} />
        </NetworkProvider>
      </ConfigurationContext.Provider>
    )
  }

  describe('with a verified proof record', () => {
    beforeEach(() => {
      jest.clearAllMocks()

      // @ts-ignore
      useProofById.mockReturnValue(testVerifiedProofRequest)
      // @ts-ignore
      jest.spyOn(proofUtils, 'getProofData').mockReturnValue(Promise.resolve(data))
    })

    const testVerifiedProofRequest = new ProofExchangeRecord({
      connectionId: undefined,
      threadId: requestPresentationMessage.id,
      state: ProofState.Done,
      protocolVersion: 'V1',
      isVerified: true,
    })

    const checkAttributes = async (tree: RenderAPI) => {
      const firstNameAttribute = await tree.findByText('first_name', { exact: true })
      const firstNameAttributeValue = await tree.findByText('Aries', { exact: true })
      const secondNameAttribute = await tree.findByText('second_name', { exact: true })
      const secondNameAttributeValue = await tree.findByText('Bifold', { exact: true })

      expect(firstNameAttribute).not.toBe(null)
      expect(firstNameAttributeValue).not.toBe(null)
      expect(secondNameAttribute).not.toBe(null)
      expect(secondNameAttributeValue).not.toBe(null)
    }

    test('renders correctly when history is true', async () => {
      const tree = renderView({ recordId: testVerifiedProofRequest.id, isHistory: true })

      await act(async () => null)
      expect(tree).toMatchSnapshot()

      const proofDetailsHistoryView = await tree.findByTestId(testIdWithKey('ProofDetailsHistoryView'))
      expect(proofDetailsHistoryView).not.toBe(null)

      await checkAttributes(tree)
    })

    test('renders correctly when history is false', async () => {
      const tree = renderView({ recordId: testVerifiedProofRequest.id, isHistory: false })

      await act(async () => null)
      expect(tree).toMatchSnapshot()

      const proofDetailsView = await tree.findByTestId(testIdWithKey('ProofDetailsView'))
      const generateNewButton = await tree.findByTestId(testIdWithKey('GenerateNewQR'))

      expect(proofDetailsView).not.toBe(null)
      expect(generateNewButton).not.toBe(null)

      await checkAttributes(tree)
    })

    test('Generate new QR code button should navigate correctly', async () => {
      const navigation = useNavigation()
      const tree = renderView({ recordId: testVerifiedProofRequest.id, isHistory: false })

      await act(async () => null)

      const generateNewButton = tree.getByTestId(testIdWithKey('GenerateNewQR'))
      expect(generateNewButton).not.toBeNull()

      fireEvent(generateNewButton, 'press')
      expect(navigation.navigate).toBeCalledWith('Proof Requests', {})
    })
  })

  describe('renders correctly with an unverified proof', () => {
    const testUnverifiedProofRequest = new ProofExchangeRecord({
      connectionId: '123',
      threadId: requestPresentationMessage.id,
      state: ProofState.Done,
      protocolVersion: 'V1',
      isVerified: false,
    })

    beforeEach(() => {
      jest.clearAllMocks()

      // @ts-ignore
      useProofById.mockReturnValue(testUnverifiedProofRequest)
    })

    test('Unverified proof view should be rendered correctly', async () => {
      const tree = renderView({ recordId: testUnverifiedProofRequest.id, isHistory: false })

      await act(async () => null)
      expect(tree).toMatchSnapshot()

      const unverifiedView = await tree.getByTestId(testIdWithKey('UnverifiedProofView'))
      expect(unverifiedView).not.toBeNull()
    })
  })
})
