import { useNavigation } from '@react-navigation/core'
import { render, waitFor } from '@testing-library/react-native'
import React from 'react'
import { container } from 'tsyringe'

import { ContainerProvider } from '../../App/container-api'
import { MainContainer } from '../../App/container-impl'
import { useConfiguration } from '../../App/contexts/configuration'
import Scan from '../../App/screens/Scan'

jest.mock('react-native-permissions', () => require('react-native-permissions/mock'))
jest.mock('@react-navigation/core', () => {
  return require('../../__mocks__/custom/@react-navigation/core')
})
jest.mock('@react-navigation/native', () => {
  return require('../../__mocks__/custom/@react-navigation/native')
})

jest.mock('react-native-vision-camera', () => {
  return require('../../__mocks__/custom/react-native-camera')
})
jest.mock('react-native-orientation-locker', () => {
  return require('../../__mocks__/custom/react-native-orientation-locker')
})
jest.mock('../../App/contexts/configuration', () => ({
  useConfiguration: jest.fn(),
}))
jest.mock('@hyperledger/anoncreds-react-native', () => ({}))
jest.mock('@hyperledger/aries-askar-react-native', () => ({}))
jest.mock('@hyperledger/indy-vdr-react-native', () => ({}))

describe('Scan Screen', () => {
  beforeEach(() => {
    // @ts-ignore-next-line
    useConfiguration.mockReturnValue({ showScanHelp: true, showScanButton: true })
    jest.clearAllMocks()
  })

  test('Renders correctly', async () => {
    const main = new MainContainer(container.createChildContainer()).init()
    const tree = render(
      <ContainerProvider value={main}>
        <Scan navigation={useNavigation()} route={{} as any} />
      </ContainerProvider>
    )
    await waitFor(
      () => {
        expect(tree).toMatchSnapshot()
      },
      { timeout: 10000 }
    )
  })
})
