import { render } from '@testing-library/react-native'
import React from 'react'

import PINCreateHeader from '../../App/components/misc/PINCreateHeader'

describe('PINCreateHeader Component', () => {
  test('Renders correctly', async () => {
    const tree = render(<PINCreateHeader />)

    expect(tree).toMatchSnapshot()
  })
})
