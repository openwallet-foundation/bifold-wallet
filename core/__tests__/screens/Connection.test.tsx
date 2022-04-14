import { useNavigation } from '@react-navigation/core'
import { render, waitFor, fireEvent } from '@testing-library/react-native'
import React from 'react'

import ConnectionModal from '../../App/screens/Connection'
import { testIdWithKey } from '../../App/utils/testable'

jest.useFakeTimers('legacy')
jest.spyOn(global, 'setTimeout')
// jest.mock('NativeAnimatedHelp')
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const props = { params: { connectionId: '123' } }

describe('ConnectionModal Component', () => {
  test('Renders correctly', async () => {
    const tree = render(<ConnectionModal route={props as any} navigation={useNavigation()} />)

    const backHomeBtn = tree.queryByTestId(testIdWithKey('BackToHome'))

    expect(tree).toMatchSnapshot()
    expect(backHomeBtn).toBeNull()
  })

  test('Updates after delay', async () => {
    const tree = render(<ConnectionModal route={props as any} navigation={useNavigation()} />)

    await waitFor(() => {
      jest.runAllTimers()
    })

    expect(tree).toMatchSnapshot()
  })

  test('Dismiss on demand', async () => {
    const tree = render(<ConnectionModal route={props as any} navigation={useNavigation()} />)

    await waitFor(() => {
      jest.runAllTimers()
    })

    const backHomeBtn = tree.getByTestId(testIdWithKey('BackToHome'))
    fireEvent(backHomeBtn, 'press')

    expect(tree).toMatchSnapshot()
  })
})
