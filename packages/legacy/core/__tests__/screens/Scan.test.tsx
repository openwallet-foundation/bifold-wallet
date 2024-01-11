import { useNavigation } from '@react-navigation/core'
import { render, waitFor } from '@testing-library/react-native'
import React from 'react'
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

describe('Scan Screen', () => {
  beforeEach(() => {
    // @ts-ignore-next-line
    useConfiguration.mockReturnValue({ showScanHelp: true, showScanButton: true })
    jest.clearAllMocks()
  })

  test('Renders correctly', async () => {
    const tree = render(<Scan navigation={useNavigation()} route={{} as any} />)
    await waitFor(
      () => {
        expect(tree).toMatchSnapshot()
      },
      { timeout: 10000 }
    )
  })
})
