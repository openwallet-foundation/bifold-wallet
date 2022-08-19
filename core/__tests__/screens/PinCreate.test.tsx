import { render } from '@testing-library/react-native'
import React from 'react'

import { AuthContext } from '../../App/contexts/auth'
import PinCreate from '../../App/screens/PinCreate'

jest.mock('@react-navigation/core', () => {
  return require('../../__mocks__/custom/@react-navigation/core')
})
jest.mock('@react-navigation/native', () => {
  return require('../../__mocks__/custom/@react-navigation/native')
})

describe('displays a pin create screen', () => {
  test('pin create renders correctly', () => {
    const tree = render(
      <AuthContext.Provider
        value={{
          setAppPIN: jest.fn(),
        }}
      >
        <PinCreate setAuthenticated={jest.fn()} />
      </AuthContext.Provider>
    )
    expect(tree).toMatchSnapshot()
  })
})
