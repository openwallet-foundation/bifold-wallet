import { render, waitFor, fireEvent } from '@testing-library/react-native'
import React, { useContext } from 'react'

import * as themeContext from '../../src/utils/themeContext'; // note we're importing with a * to import all the exports
import { defaultTheme } from '../../src/theme'
import ErrorModal from '../../src/components/modals/ErrorModal'

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
    jest.spyOn(themeContext, 'useThemeContext')
			.mockImplementation(() => defaultTheme);
    const tree = render(<ErrorModal />)

    expect(tree).toMatchSnapshot()
    expect(tree.queryByText('Global.Okay')).not.toBeNull()
  })

  test('Dismiss on demand', async () => {
    jest.spyOn(themeContext, 'useThemeContext')
			.mockImplementation(() => defaultTheme);
    const tree = render(<ErrorModal />)

    const dismissBtn = await tree.findByText('Global.Okay')
    fireEvent(dismissBtn, 'press')

    expect(tree).toMatchSnapshot()
  })
})
