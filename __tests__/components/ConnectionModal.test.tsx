import { render, waitFor, fireEvent } from '@testing-library/react-native'
import React, { useContext } from 'react'

import ConnectionModal from '../../App/components/modals/ConnectionModal'

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn(),
}))

jest.useFakeTimers('legacy')
jest.spyOn(global, 'setTimeout')

const setState = jest.fn()
const state = {
  onboarding: {
    DidAgreeToTerms: false,
    DidCompleteTutorial: false,
    DidCreatePIN: false,
  },
  notifications: {
    ConnectionPending: true,
  },
  error: null,
}

// @ts-ignore
useContext.mockImplementation(() => [state, setState])

describe('ConnectionModal Component', () => {
  test('Renders correctly', async () => {
    const tree = render(<ConnectionModal />)

    expect(tree).toMatchSnapshot()
    expect(tree.queryByText('Loading.BackToHome')).toBeNull()
  })

  test('Updates after delay', async () => {
    const tree = render(<ConnectionModal />)

    await waitFor(() => {
      jest.runAllTimers()
    })

    expect(tree).toMatchSnapshot()
  })

  test('Dismiss on demand', async () => {
    const tree = render(<ConnectionModal />)

    await waitFor(() => {
      jest.runAllTimers()
    })

    const backHomeBtn = await tree.findByText('Loading.BackToHome')
    fireEvent(backHomeBtn, 'press')

    expect(tree).toMatchSnapshot()
  })
})
