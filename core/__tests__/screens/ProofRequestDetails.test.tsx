import mockRNCNetInfo from '@react-native-community/netinfo/jest/netinfo-mock'
import { useNavigation } from '@react-navigation/core'
import { act, fireEvent, render } from '@testing-library/react-native'
import React from 'react'

import { ConfigurationContext } from '../../App/contexts/configuration'
import { NetworkProvider } from '../../App/contexts/network'
import configurationContext from '../contexts/configuration'
import { defaultProofRequestTemplates } from '../../verifier/constants'
import ProofRequestDetails from '../../App/screens/ProofRequestDetails'
import { testIdWithKey } from '../../App'

jest.mock('react-native-permissions', () => require('react-native-permissions/mock'))
jest.mock('@react-native-community/netinfo', () => mockRNCNetInfo)
jest.mock('@react-navigation/core', () => {
  return require('../../__mocks__/custom/@react-navigation/core')
})
jest.mock('@react-navigation/native', () => {
  return require('../../__mocks__/custom/@react-navigation/native')
})
// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.mock('react-native-localize', () => {})
jest.mock('react-native-device-info', () => () => jest.fn())

jest.useFakeTimers('legacy')
jest.spyOn(global, 'setTimeout')

const templateId = defaultProofRequestTemplates[0].id
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

  test('Renders correctly', async () => {
    const tree = renderView({ templateId })
    await act(async () => null)
    expect(tree).toMatchSnapshot()
  })

  test('Schema and attributes are human readable', async () => {
    const tree = renderView({ templateId })

    const schema = await tree.findAllByText('Full Name', { exact: false })
    const credential = await tree.findByText('Verified Person', { exact: false })
    const givenNames = await tree.findByText('Given Names', { exact: false })
    const familyName = await tree.findByText('Family Name', { exact: false })

    expect(schema.length).toBe(2)
    expect(credential).not.toBe(null)
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
