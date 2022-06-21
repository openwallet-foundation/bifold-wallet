import { render } from '@testing-library/react-native'
import React from 'react'

import { AuthContext } from '../../App/contexts/auth'
import PinEnter from '../../App/screens/PinEnter'

describe('displays a pin create screen', () => {
  test('pin create renders correctly', () => {
    const tree = render(
      <AuthContext.Provider
        value={{
          getWalletSecret: jest.fn(),
          getKeyForPIN: jest.fn(),
        }}
      >
        <PinEnter setAuthenticated={jest.fn()} checkPIN={jest.fn()} />
      </AuthContext.Provider>
    )
    expect(tree).toMatchSnapshot()
  })
})
