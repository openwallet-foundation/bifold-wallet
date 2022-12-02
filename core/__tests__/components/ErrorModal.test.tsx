import { render, fireEvent } from '@testing-library/react-native'
import React, { useContext } from 'react'

import ErrorModal from '../../App/components/modals/ErrorModal'
import * as themeContext from '../../App/contexts/theme' // note we're importing with a * to import all the exports
import { theme } from '../../App/theme'

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
    jest.spyOn(themeContext, 'useTheme').mockImplementation(() => theme)
    const tree = render(<ErrorModal />)

    expect(tree).toMatchSnapshot()
    expect(tree.queryByText('Global.Okay')).not.toBeNull()
  })

  test('Dismiss on demand', async () => {
    jest.spyOn(themeContext, 'useTheme').mockImplementation(() => theme)
    const tree = render(<ErrorModal />)

    const dismissBtn = await tree.findByText('Global.Okay')
    fireEvent(dismissBtn, 'press')

    expect(tree).toMatchSnapshot()
  })
})
