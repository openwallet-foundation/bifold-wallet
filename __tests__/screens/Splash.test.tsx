import { render } from '@testing-library/react-native'
import React from 'react'

import Splash from '../../App/screens/Splash'

describe('Splash Screen', () => {
  it('Renders correctly', () => {
    const tree = render(<Splash />).toJSON()

    expect(tree).toMatchSnapshot()
  })
})
