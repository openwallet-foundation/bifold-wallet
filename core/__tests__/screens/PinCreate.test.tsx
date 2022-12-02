import { render } from '@testing-library/react-native'
import React from 'react'

import { AuthContext } from '../../App/contexts/auth'
import PinCreate from '../../App/screens/PinCreate'
import authContext from '../contexts/auth'

jest.mock('@react-navigation/core', () => {
  return require('../../__mocks__/custom/@react-navigation/core')
})
jest.mock('@react-navigation/native', () => {
  return require('../../__mocks__/custom/@react-navigation/native')
})

describe('displays a pin create screen', () => {
  test.skip('pin create renders correctly', async () => {
    const tree = render(
      <AuthContext.Provider value={authContext}>
        <PinCreate setAuthenticated={jest.fn()} />
      </AuthContext.Provider>
    )

    expect(tree).toMatchSnapshot()
  })
})
