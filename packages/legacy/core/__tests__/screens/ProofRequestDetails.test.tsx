import mockRNCNetInfo from '@react-native-community/netinfo/jest/netinfo-mock'
import { useNavigation } from '@react-navigation/native'
import { act, fireEvent, render } from '@testing-library/react-native'
import React from 'react'

import { ConfigurationContext } from '../../App/contexts/configuration'
import { NetworkProvider } from '../../App/contexts/network'
import configurationContext from '../contexts/configuration'
import ProofRequestDetails from '../../App/screens/ProofRequestDetails'
import { testIdWithKey } from '../../App'
import { ProofRequestType } from '@hyperledger/aries-bifold-verifier'
import { useTemplates, useTemplate } from '../../App/hooks/proof-request-templates'
import axios from 'axios'
import { applyTemplateMarkers, useRemoteProofBundleResolver } from '../../App/utils/proofBundle'

jest.mock('../../App/container-api')
jest.mock('react-native-permissions', () => require('react-native-permissions/mock'))
jest.mock('@react-native-community/netinfo', () => mockRNCNetInfo)
jest.mock('react-native-vision-camera', () => {
  return require('../../__mocks__/custom/react-native-camera')
})
jest.mock('react-native-device-info', () => () => jest.fn())
jest.mock('../../App/hooks/proof-request-templates', () => ({
  useTemplates: jest.fn(),
  useTemplate: jest.fn(),
}))
jest.mock('axios', () => ({ create: jest.fn() }))

jest.useFakeTimers({ legacyFakeTimers: true })
jest.spyOn(global, 'setTimeout')

const templates = [
  {
    id: 'Aries:5:StudentFullName:0.0.1:indy',
    name: 'Student full name',
    description: 'Verify the full name of a student',
    version: '0.0.1',
    payload: {
      type: ProofRequestType.AnonCreds,
      data: [
        {
          schema: 'XUxBrVSALWHLeycAUhrNr9:3:CL:26293:Student Card',
          requestedAttributes: [
            {
              names: ['student_first_name', 'student_last_name'],
              restrictions: [{ cred_def_id: 'XUxBrVSALWHLeycAUhrNr9:3:CL:26293:student_card' }],
              devRestrictions: [{ schema_name: 'student_card' }],
              non_revoked: { to: '@{now}' },
            },
          ],
          requestedPredicates: [
            {
              name: 'expiry_date',
              predicateType: '>=',
              predicateValue: '@{currentDate(0)}',
              restrictions: [{ cred_def_id: 'XUxBrVSALWHLeycAUhrNr9:3:CL:26293:student_card' }],
              devRestrictions: [{ schema_name: 'student_card' }],
            },
          ],
        },
      ],
    },
  },
]

// @ts-ignore
axios.create.mockImplementation(() => ({ get: () => Promise.resolve({ data: templates }) }))
// @ts-ignore
useTemplates.mockImplementation(() => templates)
// @ts-ignore
useTemplate.mockImplementation(() => templates[0])
const templateId = templates[0].id
const connectionId = 'test'
const navigation = useNavigation()

describe('ProofRequestDetails Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const renderView = (params: { templateId: string; connectionId?: string }) => {
    return render(
      <ConfigurationContext.Provider value={configurationContext}>
        <NetworkProvider>
          <ProofRequestDetails navigation={navigation as any} route={{ params: params } as any} />
        </NetworkProvider>
      </ConfigurationContext.Provider>
    )
  }

  test('Proof bundle resolver works correctly', async () => {
    const resolver = useRemoteProofBundleResolver('http://localhost:3000')
    const bundle = await resolver.resolve(true)
    expect((bundle?.[0].payload.data[0] as any).requestedAttributes[0].restrictions.length).toBe(2)
  })

  test('Template is parsed correctly', async () => {
    const template = templates[0]
    const parsedTemplate = applyTemplateMarkers(template)
    expect(parsedTemplate.payload.data[0].requestedAttributes[0].non_revoked.to).not.toBe('@{now}')
    expect(parsedTemplate.payload.data[0].requestedPredicates[0].predicateValue.to).not.toBe('@{currentDate(0)}')
  })

  test('Renders correctly', async () => {
    const tree = renderView({ templateId })
    await act(async () => {})
    expect(tree).toMatchSnapshot()
  })

  test('Schema and attributes are human readable', async () => {
    const tree = renderView({ templateId })

    const schema = await tree.findByText('Student full name', { exact: false })
    const credential = await tree.findAllByText('Student', { exact: false })
    const givenNames = await tree.findByText('First Name', { exact: false })
    const familyName = await tree.findByText('Last Name', { exact: false })

    expect(schema).not.toBe(null)
    expect(credential.length).toBe(3)
    expect(givenNames).not.toBe(null)
    expect(familyName).not.toBe(null)
  })

  test('Renders correctly when not pass connection id and pressing on a use proof request takes the user to a proof requesting screen', async () => {
    const tree = renderView({ templateId })

    await act(async () => {
      const useButton = tree.getByTestId(testIdWithKey('UseProofRequest'))

      fireEvent(useButton, 'press')

      expect(navigation.navigate).toBeCalledWith('Proof Requesting', {
        templateId,
        predicateValues: {},
      })
    })
  })

  test('Renders correctly when pass connection id and pressing on a send proof request takes the user to a chat', async () => {
    const tree = renderView({ templateId, connectionId })

    await act(async () => {
      const useButton = tree.getByTestId(testIdWithKey('SendThisProofRequest'))

      fireEvent(useButton, 'press')

      expect(navigation.navigate).toBeCalledWith('Chat', {
        connectionId,
      })
    })
  })
})
