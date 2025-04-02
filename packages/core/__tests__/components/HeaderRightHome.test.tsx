import { render } from '@testing-library/react-native'
import React from 'react'

import HeaderRightHome from '../../src/components/buttons/HeaderHome'

describe('HeaderRightHome Component', () => {
  test('Renders correctly', () => {
    const tree = render(<HeaderRightHome />)

    expect(tree).toMatchSnapshot()
  })
})
