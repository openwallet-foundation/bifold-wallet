import { render } from '@testing-library/react-native'
import React from 'react'

import HeaderRightHome from '../../App/components/buttons/HeaderRightHome'

jest.mock('@react-navigation/core', () => {
  return require('../../__mocks__/custom/@react-navigation/core')
})
jest.mock('@react-navigation/native', () => {
  return require('../../__mocks__/custom/@react-navigation/native')
})

describe('Header Right Home Component', () => {
  test('Renders correctly', () => {
    const tree = render(<HeaderRightHome />)

    expect(tree).toMatchSnapshot()
  })
})
