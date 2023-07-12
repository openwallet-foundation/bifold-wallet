import { render } from '@testing-library/react-native'
import React from 'react'

import { ConfigurationContext } from '../../App/contexts/configuration'
import * as network from '../../App/contexts/network'
import Chat from '../../App/screens/Chat'
import configurationContext from '../contexts/configuration'
import navigationContext from '../contexts/navigation'

jest.mock('@react-navigation/core', () => {
  return require('../../__mocks__/custom/@react-navigation/core')
})
jest.mock('@react-navigation/native', () => {
  return require('../../__mocks__/custom/@react-navigation/native')
})

const props = { params: { connectionId: '123' } }

describe('Chat screen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Renders correctly', async () => {
    jest.spyOn(network, 'useNetwork').mockImplementation(() => ({
      silentAssertConnectedNetwork: () => true,
      assertConnectedNetwork: () => true,
      assertLedgerConnectivity: jest.fn(),
      displayNetInfoModal: jest.fn(),
      hideNetInfoModal: jest.fn(),
    }))
    const element = (
      <ConfigurationContext.Provider value={configurationContext}>
        <Chat navigation={navigationContext} route={props as any} />
      </ConfigurationContext.Provider>
    )
    const tree = render(element)

    expect(tree).toMatchSnapshot()
  })
})
