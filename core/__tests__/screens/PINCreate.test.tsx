import { render } from '@testing-library/react-native'
import React from 'react'

import { AuthContext } from '../../App/contexts/auth'
import PINCreate from '../../App/screens/PINCreate'
import authContext from '../contexts/auth'

jest.mock('@react-navigation/core', () => {
  return require('../../__mocks__/custom/@react-navigation/core')
})
jest.mock('@react-navigation/native', () => {
  return require('../../__mocks__/custom/@react-navigation/native')
})

describe('displays a PIN create screen', () => {
  test.skip('PIN create renders correctly', async () => {
    const tree = render(
      <AuthContext.Provider value={authContext}>
        <PINCreate setAuthenticated={jest.fn()} />
      </AuthContext.Provider>
    )

    expect(tree).toMatchSnapshot()
  })
})
