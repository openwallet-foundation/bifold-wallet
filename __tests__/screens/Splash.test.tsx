import React from 'react'
import renderer from 'react-test-renderer'

import Splash from '../../App/screens/Splash'

jest.mock('@react-navigation/native', () => {
  return {
    useFocusEffect: jest.fn(),
  }
})

jest.mock('@react-navigation/core', () => {
  return {
    useNavigation: jest.fn(),
  }
})

describe('Splash Screen', () => {
  it('Renders correctly', () => {
    const tree = renderer
      // @ts-ignore
      .create(<Splash />)
      .toJSON()

    expect(tree).toMatchSnapshot()
  })
})
