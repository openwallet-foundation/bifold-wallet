import { render } from '@testing-library/react-native'
import React from 'react'

import AlertModal from '../../App/components/modals/AlertModal'

describe('AlertModal Component', () => {
  test('Renders correctly', async () => {
    const tree = render(<AlertModal title="Hello" message="World" />)

    expect(tree).toMatchSnapshot()
  })
})
