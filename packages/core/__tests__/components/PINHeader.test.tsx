import { render } from '@testing-library/react-native'
import React from 'react'

import PINHeader from '../../src/components/misc/PINHeader'

describe('PINHeader Component', () => {
  test('Renders correctly', async () => {
    const tree = render(<PINHeader />)

    expect(tree).toMatchSnapshot()
  })

  test('Renders correctly for change pin', async () => {
    const tree = render(<PINHeader updatePin />)

    expect(tree).toMatchSnapshot()
  })
})
