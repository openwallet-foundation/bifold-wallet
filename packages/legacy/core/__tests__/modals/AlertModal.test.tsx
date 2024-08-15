import { render } from '@testing-library/react-native'
import React from 'react'

import AlertModal from '../../App/components/modals/AlertModal'
import { BasicAppContext } from '../helpers/app'



describe('AlertModal Component', () => {
  test('Renders correctly', async () => {
    const tree = render(<BasicAppContext><AlertModal title="Hello" message="World" /></BasicAppContext>)

    expect(tree).toMatchSnapshot()
  })

})
