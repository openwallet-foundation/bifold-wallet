import { render } from '@testing-library/react-native'
import React from 'react'

import { AuthContext } from '../../App/contexts/auth'
import { ConfigurationContext } from '../../App/contexts/configuration'
import Splash from '../../App/screens/Splash'
import authContext from '../contexts/auth'
import configurationContext from '../contexts/configuration'

jest.mock('@react-navigation/core', () => {
  return require('../../__mocks__/custom/@react-navigation/core')
})
jest.mock('@react-navigation/native', () => {
  return require('../../__mocks__/custom/@react-navigation/native')
})
jest.mock('@hyperledger/aries-askar-react-native', () => ({}))
jest.mock('@hyperledger/anoncreds-react-native', () => ({}))
jest.mock('@hyperledger/indy-vdr-react-native', () => ({}))
jest.mock('react-native-fs', () => ({}))

describe('Splash Screen', () => {
  test('Renders correctly', () => {
    const tree = render(
      <ConfigurationContext.Provider value={configurationContext}>
        <AuthContext.Provider value={authContext}>
          <Splash />
        </AuthContext.Provider>
      </ConfigurationContext.Provider>
    )

    expect(tree).toMatchSnapshot()
    expect(true).toBe(true)
  })
})
