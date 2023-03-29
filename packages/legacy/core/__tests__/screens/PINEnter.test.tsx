import { render } from '@testing-library/react-native'
import React from 'react'

import { AuthContext } from '../../App/contexts/auth'
import PINEnter from '../../App/screens/PINEnter'
import authContext from '../contexts/auth'

jest.mock('@react-navigation/core', () => {
  return require('../../__mocks__/custom/@react-navigation/core')
})
jest.mock('@react-navigation/native', () => {
  return require('../../__mocks__/custom/@react-navigation/native')
})

describe('displays a PIN create screen', () => {
  test('PIN create renders correctly', () => {
    const tree = render(
      <AuthContext.Provider value={authContext}>
        <PINEnter setAuthenticated={jest.fn()} />
      </AuthContext.Provider>
    )
    expect(tree).toMatchSnapshot()
  })
})
