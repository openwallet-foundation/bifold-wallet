import mockRNCNetInfo from '@react-native-community/netinfo/jest/netinfo-mock'
import { useNavigation } from '@react-navigation/native'
import { act, fireEvent, render } from '@testing-library/react-native'
import React from 'react'

import { NetworkProvider } from '../../App/contexts/network'
import ListProofRequests from '../../App/screens/ListProofRequests'
import { useProofRequestTemplates } from '@hyperledger/aries-bifold-verifier'
import { BasicAppContext } from '../helpers/app'

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter')
jest.mock('@react-native-community/netinfo', () => mockRNCNetInfo)
// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.mock('react-native-localize', () => { })

jest.useFakeTimers({ legacyFakeTimers: true })
jest.spyOn(global, 'setTimeout')

const navigation = useNavigation()

describe('ListProofRequests Component', () => {
  const renderView = (params?: any) => {
    return render(
      <BasicAppContext>
        <NetworkProvider>
          <ListProofRequests navigation={navigation as any} route={{ params: params || {} } as any} />
        </NetworkProvider>
      </BasicAppContext>
    )
  }

  test('Renders correctly', async () => {
    const tree = renderView()
    await act(async () => { })
    expect(tree).toMatchSnapshot()
  })

  test('Template names are human readable', async () => {
    const tree = renderView()

    const fullName = await tree.findByText('Student full name', { exact: true })
    const fullNameAndExpirationDate = await tree.findByText('Student full name and expiration date', { exact: false })

    expect(fullName).not.toBe(null)
    expect(fullNameAndExpirationDate).not.toBe(null)
  })

  test('Pressing on a request template takes the user to a proof request template detail screen', async () => {
    const tree = renderView()

    await act(async () => {
      const templateItemInstance = await tree.findByText('Student full name', { exact: true })

      fireEvent(templateItemInstance, 'press')

      expect(navigation.navigate).toBeCalledWith('Proof Request Details', {
        templateId: useProofRequestTemplates(false)[0].id,
      })
    })
  })
})
