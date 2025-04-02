import mockRNCNetInfo from '@react-native-community/netinfo/jest/netinfo-mock'
import { act, fireEvent, render, renderHook } from '@testing-library/react-native'
import React, { PropsWithChildren } from 'react'

import { useNavigation as testUseNavigation } from '../../__mocks__/@react-navigation/native'
import ProofRequestDetails from '../../src/screens/ProofRequestDetails'
import { ContainerProvider, MainContainer, testIdWithKey } from '../../src'
import { ProofRequestType } from '@hyperledger/aries-bifold-verifier'
import { useTemplates, useTemplate } from '../../src/hooks/proof-request-templates'
import axios from 'axios'
import { applyTemplateMarkers, useRemoteProofBundleResolver } from '../../src/utils/proofBundle'
import { BasicAppContext } from '../helpers/app'
import { container } from 'tsyringe'
import { readFile } from 'react-native-fs'

const templates = [
  {
    id: 'Aries:5:StudentFullName:0.0.1:indy_G',
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

const getMock = jest.fn().mockImplementation((url) => {
  const fileName = url.split('/').pop()
  switch (fileName) {
    case 'proof-templates.json':
      return Promise.resolve({
        status: 200,
        data: templates,
        headers: { etag: 'abc123' },
      })
    default:
      return Promise.reject(new Error('Not Found'))
  }
})

jest.mock('react-native-permissions', () => require('react-native-permissions/mock'))
jest.mock('@react-native-community/netinfo', () => mockRNCNetInfo)
jest.mock('react-native-device-info', () => () => jest.fn())
jest.mock('../../src/hooks/proof-request-templates', () => ({
  useTemplates: jest.fn(),
  useTemplate: jest.fn(),
}))
jest.mock('react-native-fs', () => ({
  exists: jest.fn().mockResolvedValue(true),
  mkdir: jest.fn().mockResolvedValue(true),
  readFile: jest.fn(),
  writeFile: jest.fn().mockResolvedValue(true),
  unlink: jest.fn().mockResolvedValue(true),
}))
jest.mock('axios', () => ({
  create: jest.fn().mockReturnValue({
    get: jest.fn(),
  }),
}))

jest.useFakeTimers({ legacyFakeTimers: true })
jest.spyOn(global, 'setTimeout')

// @ts-expect-error some weird type
readFile.mockResolvedValue(JSON.stringify(templates))
// @ts-expect-error useTemplates will be replaced with a mock which does have this method
useTemplates.mockImplementation(() => templates)
// @ts-expect-error useTemplate will be replaced with a mock which does have this method
useTemplate.mockImplementation(() => templates[0])
const templateId = templates[0].id
const connectionId = 'test'
const navigation = testUseNavigation()

describe('ProofRequestDetails Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // @ts-expect-error some weird type
    axios.create().get.mockImplementation(getMock)
  })

  const renderView = (params: { templateId: string; connectionId?: string }) => {
    return render(
      <BasicAppContext>
        <ProofRequestDetails navigation={navigation as any} route={{ params: params } as any} />
      </BasicAppContext>
    )
  }

  test('Proof bundle resolver works correctly', async () => {
    const context = new MainContainer(container.createChildContainer()).init()
    // const context = useMemo(() => new MainContainer(container.createChildContainer()).init(), [])

    const wrapper = ({ children }: PropsWithChildren) => (
      <ContainerProvider value={context}>{children}</ContainerProvider>
    )
    const { result } = renderHook(() => useRemoteProofBundleResolver('http://localhost:3000'), { wrapper })
    const bundle = await result.current.resolve(true)

    expect((bundle?.[0].payload.data[0] as any).requestedAttributes[0].restrictions).toHaveLength(2)
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
    expect(credential).toHaveLength(3)
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
