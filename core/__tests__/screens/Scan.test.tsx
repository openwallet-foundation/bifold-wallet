import { useNavigation } from '@react-navigation/core'
import { render, waitFor } from '@testing-library/react-native'
import React from 'react'

import Scan from '../../App/screens/Scan'

jest.mock('react-native-permissions', () => require('react-native-permissions/mock'))
jest.mock('@react-navigation/core', () => {
  return require('../../__mocks__/custom/@react-navigation/core')
})
jest.mock('@react-navigation/native', () => {
  return require('../../__mocks__/custom/@react-navigation/native')
})

describe('Scan Screen', () => {
  beforeEach(() => {
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
