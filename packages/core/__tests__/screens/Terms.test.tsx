import { act, fireEvent, render } from '@testing-library/react-native'
import React from 'react'
import { AuthContext } from '../../src/contexts/auth'
import { StoreProvider, defaultState } from '../../src/contexts/store'
import Terms from '../../src/screens/Terms'
import { testIdWithKey } from '../../src/utils/testable'
import authContext from '../contexts/auth'
import { BasicAppContext } from '../helpers/app'

describe('Terms Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('Renders correctly', async () => {
    const tree = render(
      <StoreProvider
        initialState={{
          ...defaultState,
        }}
      >
        <BasicAppContext>
          <AuthContext.Provider value={authContext}>
            <Terms />
          </AuthContext.Provider>
        </BasicAppContext>
      </StoreProvider>
    )
    expect(tree).toMatchSnapshot()
  })

  test('Button enabled by checkbox being checked', async () => {
    const tree = render(
      <BasicAppContext>
        <Terms />
      </BasicAppContext>
    )
    const { getByTestId } = tree
    await act(async () => {
      const checkbox = getByTestId(testIdWithKey('IAgree'))
      fireEvent(checkbox, 'press')
      expect(tree).toMatchSnapshot()
    })
  })
})
