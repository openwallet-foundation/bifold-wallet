import { useConnections } from '@aries-framework/react-hooks'
import { useAgent } from '@aries-framework/react-hooks'
import { act, render } from '@testing-library/react-native'
import React from 'react'

import NewQRView from '../../App/components/misc/NewQRView'
import { ConfigurationContext } from '../../App/contexts/configuration'
import { StoreProvider, defaultState } from '../../App/contexts/store'
import { testIdWithKey } from '../../App/utils/testable'
import { useNavigation } from '../../__mocks__/custom/@react-navigation/core'
import configurationContext from '../contexts/configuration'

jest.mock('@react-navigation/core', () => {
  return require('../../__mocks__/custom/@react-navigation/core')
})
jest.mock('@react-navigation/native', () => {
  return require('../../__mocks__/custom/@react-navigation/native')
})

jest.mock('react-native-camera', () => {
  return require('../../__mocks__/custom/react-native-camera')
})

describe('NewQRView Component', () => {
  beforeAll(() => {
    jest.useFakeTimers()
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  beforeEach(() => {
    jest.clearAllMocks()
    // @ts-ignore
    useConnections.mockReturnValue({ records: [] })
  })

  const navigation = useNavigation()

  test('Renders correctly on first tab', async () => {
    const tree = render(
      <ConfigurationContext.Provider value={configurationContext}>
        <NewQRView
          defaultToConnect={false}
          handleCodeScan={() => Promise.resolve()}
          navigation={navigation as any}
          route={{} as any}
        />
      </ConfigurationContext.Provider>
    )

    await act(() => {
      jest.runAllTimers()
    })

    expect(tree).toMatchSnapshot()
  })

  test('Renders correctly on second tab', async () => {
    // @ts-ignore
    useAgent().agent?.oob.createInvitation.mockReturnValue({
      outOfBandInvitation: {
        toUrl: () => {
          return ''
        },
      },
    })
    const tree = render(
      <StoreProvider
        initialState={{
          ...defaultState,
          preferences: {
            ...defaultState.preferences,
            walletName: 'My Wallet - 1234',
          },
        }}
      >
        <ConfigurationContext.Provider value={configurationContext}>
          <NewQRView
            defaultToConnect={true}
            handleCodeScan={() => Promise.resolve()}
            navigation={navigation as any}
            route={{} as any}
          />
        </ConfigurationContext.Provider>
      </StoreProvider>
    )

    await act(() => {
      jest.runAllTimers()
    })

    expect(tree).toMatchSnapshot()
  })

  test('Contains test IDs', async () => {
    // @ts-ignore
    useAgent().agent?.oob.createInvitation.mockReturnValue({
      outOfBandInvitation: {
        toUrl: () => {
          return ''
        },
      },
    })
    const { getByTestId } = render(
      <StoreProvider
        initialState={{
          ...defaultState,
          preferences: {
            ...defaultState.preferences,
            walletName: 'My Wallet - 1234',
          },
        }}
      >
        <ConfigurationContext.Provider value={configurationContext}>
          <NewQRView
            defaultToConnect={true}
            handleCodeScan={() => Promise.resolve()}
            navigation={navigation as any}
            route={{} as any}
          />
        </ConfigurationContext.Provider>
      </StoreProvider>
    )

    await act(() => {
      jest.runAllTimers()
    })

    const editButtonByTestId = getByTestId(testIdWithKey('EditWalletName'))

    expect(editButtonByTestId).not.toBeNull()
  })
})
