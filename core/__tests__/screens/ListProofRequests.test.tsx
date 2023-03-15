import mockRNCNetInfo from '@react-native-community/netinfo/jest/netinfo-mock'
import { useNavigation } from '@react-navigation/core'
import { act, fireEvent, render } from '@testing-library/react-native'
import React from 'react'

import { ConfigurationContext } from '../../App/contexts/configuration'
import { NetworkProvider } from '../../App/contexts/network'
import configurationContext from '../contexts/configuration'
import ListProofRequests from '../../App/screens/ListProofRequests'
import { defaultProofRequestTemplates } from '../../verifier/constants'
import ProofRequestDetails from '../../App/screens/ProofRequestDetails'

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

const navigation = useNavigation()

describe('ListProofRequests Component', () => {
  const renderView = (params?: {}) => {
    return render(
      <ConfigurationContext.Provider value={configurationContext}>
        <NetworkProvider>
          <ListProofRequests navigation={navigation as any} route={{ params: params || {} } as any} />
        </NetworkProvider>
      </ConfigurationContext.Provider>
    )
  }

  test('Renders correctly', async () => {
    const tree = renderView()
    await act(async () => null)
    expect(tree).toMatchSnapshot()
  })

  test('Schema names are human readable', async () => {
    const tree = renderView()

    const fullName = await tree.findByText('19+ and Full name', { exact: false })
    const overYearsOfAge = await tree.findByText(' 19 years of age', { exact: false })

    expect(fullName).not.toBe(null)
    expect(overYearsOfAge).not.toBe(null)
  })

  test('Pressing on a request template takes the user to a proof request template detail screen', async () => {
    const tree = renderView()

    await act(async () => {
      const templateItemInstances = await tree.findAllByText('19+ and Full name', { exact: false })

      expect(templateItemInstances.length).toBe(1)

      const templateItemInstance = templateItemInstances[0]

      fireEvent(templateItemInstance, 'press')

      expect(navigation.navigate).toBeCalledWith('Proof Request Details', {
        templateId: defaultProofRequestTemplates[1].id,
      })
    })
  })
})
