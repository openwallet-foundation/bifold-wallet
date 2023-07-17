import { useConnections } from '@aries-framework/react-hooks'
import { useNavigation } from '@react-navigation/core'
import { render } from '@testing-library/react-native'
import React from 'react'

import { ConfigurationContext } from '../../App/contexts/configuration'
import ConnectionInvitation from '../../App/screens/ConnectionInvitation'
import { Screens } from '../../App/types/navigators'
import configurationContext from '../contexts/configuration'

jest.mock('@react-navigation/core', () => {
  return require('../../__mocks__/custom/@react-navigation/core')
})
jest.mock('@react-navigation/native', () => {
  return require('../../__mocks__/custom/@react-navigation/native')
})

describe('ConnectionInvitation screen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // @ts-ignore
    useConnections.mockReturnValue({ records: [] })
  })

  test('Renders correctly', async () => {
    const tree = render(
      <ConfigurationContext.Provider value={configurationContext}>
        <ConnectionInvitation navigation={useNavigation()} route={{ key: '', name: Screens.ConnectionInvitation }} />
      </ConfigurationContext.Provider>
    )

    expect(tree).toMatchSnapshot()
  })
})
