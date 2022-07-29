import { render } from '@testing-library/react-native'
import React from 'react'

import CommonDeleteModal from '../../App/components/modals/CommonDeleteModal'

describe('ErrorModal Component', () => {
  test('Renders correctly', async () => {
    const tree = render(<CommonDeleteModal />)

    expect(tree).toMatchSnapshot()
  })
})
