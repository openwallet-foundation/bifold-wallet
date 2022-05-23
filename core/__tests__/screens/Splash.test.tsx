import { render } from '@testing-library/react-native'
import React from 'react'

import Splash from '../../App/screens/Splash'

jest.mock('@react-navigation/core', () => {
  return require('../../__mocks__/custom/@react-navigation/core')
})
jest.mock('@react-navigation/native', () => {
  return require('../../__mocks__/custom/@react-navigation/native')
})

describe('Splash Screen', () => {
  it('Renders correctly', () => {
    const tree = render(<Splash />).toJSON()

    expect(tree).toMatchSnapshot()
  })
})
