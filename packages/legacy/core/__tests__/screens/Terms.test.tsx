import { fireEvent, render } from '@testing-library/react-native'
import React from 'react'

import Terms from '../../App/screens/Terms'
import { testIdWithKey } from '../../App/utils/testable'
import { ContainerProvider } from '../../App/container-api'
import { MainContainer } from '../../App/container-impl'
import { container } from 'tsyringe'
import { StoreProvider, defaultState } from '../../App/contexts/store'
import { AuthContext } from '../../App/contexts/auth'
import authContext from '../contexts/auth'
import { ConfigurationContext } from '../../App/contexts/configuration'
import configurationContext from '../contexts/configuration'

jest.mock('@react-navigation/core', () => {
  return require('../../__mocks__/custom/@react-navigation/core')
})
jest.mock('@react-navigation/native', () => {
  return require('../../__mocks__/custom/@react-navigation/native')
})
jest.mock('react-native-fs', () => ({}))
jest.mock('@hyperledger/anoncreds-react-native', () => ({}))
jest.mock('@hyperledger/aries-askar-react-native', () => ({}))
jest.mock('@hyperledger/indy-vdr-react-native', () => ({}))


describe('Terms Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('Renders correctly', async () => {
    const main = new MainContainer(container.createChildContainer()).init()
    const tree = render(<ContainerProvider value={main}>
              <StoreProvider
          initialState={{
            ...defaultState,
          }}
        >
          <ConfigurationContext.Provider value={configurationContext}>
          <AuthContext.Provider value={authContext}>
      <Terms />
      </AuthContext.Provider>
      </ConfigurationContext.Provider></StoreProvider></ContainerProvider>)
    expect(tree).toMatchSnapshot()
  })

  test('Button enabled by checkbox being checked', async () => {
    const main = new MainContainer(container.createChildContainer()).init()
    const tree = render(<ContainerProvider value={main}><Terms /></ContainerProvider>)
    const { getByTestId } = tree
    const checkbox = getByTestId(testIdWithKey('IAgree'))
    fireEvent(checkbox, 'press')
    expect(tree).toMatchSnapshot()
  })
})
