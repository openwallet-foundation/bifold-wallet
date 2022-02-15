import { render, waitFor, fireEvent } from '@testing-library/react-native'
import React, { useContext } from 'react'

import ErrorModal from '../../App/components/modals/ErrorModal'

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn(),
}))

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

describe('ErrorModal Component', () => {
  test('Renders correctly', async () => {
    const tree = render(<ErrorModal />)

    expect(tree).toMatchSnapshot()
    expect(tree.queryByText('Connection.BackToHome')).toBeNull()
  })

  test('Dismiss on demand', async () => {
    const tree = render(<ErrorModal />)

    const dismissBtn = await tree.findByText('Global.Okay')
    fireEvent(dismissBtn, 'press')

    console.log(tree)
    expect(tree).toMatchSnapshot()
  })
})
