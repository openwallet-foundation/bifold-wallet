import { render } from '@testing-library/react-native'
import React from 'react'

import HomeHeaderView from '../../App/components/views/HomeHeaderView'

describe('HomeHeaderView Component', () => {
  test('Renders correctly', async () => {
    const tree = render(<HomeHeaderView />)

    expect(tree).toMatchSnapshot()
  })
})
