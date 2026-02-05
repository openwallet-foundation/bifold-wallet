import { useAgent, useConnections } from '@bifold/react-hooks'
import { act, render, fireEvent } from '@testing-library/react-native'
import React from 'react'

import QRScanner from '../../src/components/misc/QRScanner'
import { StoreProvider, defaultState } from '../../src/contexts/store'
import { testIdWithKey } from '../../src/utils/testable'
import { useNavigation } from '@react-navigation/native'
import { BasicAppContext } from '../helpers/app'

jest.mock('react-native-orientation-locker', () => {
  return require('../../__mocks__/custom/react-native-orientation-locker')
})

jest.mock('react-native-vision-camera', () => ({
  useCameraDevice: jest.fn(() => ({
    id: 'mock-camera',
    position: 'back',
    supportsFocus: true,
  })),
  useCameraFormat: jest.fn(() => ({})),
  useCodeScanner: jest.fn((config) => config),
  Camera: 'Camera',
}))

describe('QRScanner Component', () => {
  beforeAll(() => {
    jest.useFakeTimers()
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  beforeEach(() => {
    jest.clearAllMocks()
    // @ts-expect-error useConnections will be replaced with a mock which will have this method
    useConnections.mockReturnValue({ records: [] })
  })

  const navigation = useNavigation()

  test('Scanner with no tabs renders correctly', async () => {
    const tree = render(
      <BasicAppContext>
        <QRScanner
          showTabs={false}
          defaultToConnect={false}
          handleCodeScan={() => Promise.resolve()}
          navigation={navigation as any}
          route={{} as any}
        />
      </BasicAppContext>
    )

    await act(() => {
      jest.runAllTimers()
    })

    expect(tree).toMatchSnapshot()
  })

  test('Focus animation does not render before tapping', async () => {
    const tree = render(
      <BasicAppContext>
        <QRScanner
          showTabs={false}
          defaultToConnect={false}
          handleCodeScan={() => Promise.resolve()}
          navigation={navigation as any}
          route={{} as any}
        />
      </BasicAppContext>
    )
    await act(() => {
      jest.runAllTimers()
    })

    expect(tree).toMatchSnapshot()

    const { getByTestId, queryByTestId } = tree
    const scanner = getByTestId(testIdWithKey('QRScanner'))
    const focusIndicator = queryByTestId(testIdWithKey('FocusIndicator'))
    expect(scanner).toBeTruthy()
    expect(focusIndicator).toBeNull()
  })

  test('Tap on focus area renders animation', async () => {
    const { getByTestId, queryByTestId } = render(
      <BasicAppContext>
        <QRScanner
          showTabs={false}
          defaultToConnect={false}
          handleCodeScan={() => Promise.resolve()}
          navigation={navigation as any}
          route={{} as any}
        />
      </BasicAppContext>
    )
    await act(() => {
      jest.runAllTimers()
    })

    const tapArea = getByTestId(testIdWithKey('ScanCameraTapArea'))

    // focus indicator should not be present before tap
    expect(queryByTestId(testIdWithKey('FocusIndicator'))).toBeNull()

    // tap
    await act(async () => {
      fireEvent(tapArea, 'pressIn', {
        nativeEvent: { locationX: 100, locationY: 100 },
      })
    })

    // focus animation should be present now
    const focusIndicator = queryByTestId(testIdWithKey('FocusIndicator'))
    expect(focusIndicator).toBeTruthy()

    await act(() => {
      jest.runAllTimers()
    })

    // focus animation should be gone now
    expect(queryByTestId(testIdWithKey('FocusIndicator'))).toBeNull()
  })

  test('Renders correctly on first tab', async () => {
    const tree = render(
      <BasicAppContext>
        <QRScanner
          showTabs={true}
          defaultToConnect={false}
          handleCodeScan={() => Promise.resolve()}
          navigation={navigation as any}
          route={{} as any}
        />
      </BasicAppContext>
    )

    await act(() => {
      jest.runAllTimers()
    })

    expect(tree).toMatchSnapshot()
  })

  test('Renders correctly on second tab', async () => {
    // @ts-expect-error useAgent will be replaced with a mock which will have this method
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
        <BasicAppContext>
          <QRScanner
            showTabs={true}
            defaultToConnect={true}
            handleCodeScan={() => Promise.resolve()}
            navigation={navigation as any}
            route={{} as any}
          />
        </BasicAppContext>
      </StoreProvider>
    )

    await act(() => {
      jest.runAllTimers()
    })

    expect(tree).toMatchSnapshot()
  })

  test('Contains test IDs', async () => {
    // @ts-expect-error useAgent will be replaced with a mock which will have this method
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
        <BasicAppContext>
          <QRScanner
            showTabs={true}
            defaultToConnect={true}
            handleCodeScan={() => Promise.resolve()}
            navigation={navigation as any}
            route={{} as any}
          />
        </BasicAppContext>
      </StoreProvider>
    )

    await act(() => {
      jest.runAllTimers()
    })

    const editButtonByTestId = getByTestId(testIdWithKey('EditWalletName'))

    expect(editButtonByTestId).not.toBeNull()
  })
})
