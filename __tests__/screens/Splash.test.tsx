import React from 'react'
import { create } from 'react-test-renderer'

import Splash from '../../App/screens/Splash'

describe('Splash Screen', () => {
  it('Renders correctly', () => {
    const tree = create(<Splash />).toJSON()

    expect(tree).toMatchSnapshot()
  })
})
