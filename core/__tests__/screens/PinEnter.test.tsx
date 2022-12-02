import { render } from '@testing-library/react-native'
import React from 'react'

import { AuthContext } from '../../App/contexts/auth'
import PinEnter from '../../App/screens/PinEnter'
import authContext from '../contexts/auth'

jest.mock('@react-navigation/core', () => {
  return require('../../__mocks__/custom/@react-navigation/core')
})
jest.mock('@react-navigation/native', () => {
  return require('../../__mocks__/custom/@react-navigation/native')
})

describe('displays a pin create screen', () => {
  test('pin create renders correctly', () => {
    const tree = render(
      <AuthContext.Provider value={authContext}>
        <PinEnter setAuthenticated={jest.fn()} />
      </AuthContext.Provider>
    )
    expect(tree).toMatchSnapshot()
  })
})
