import { render } from '@testing-library/react-native'
import React from 'react'

import PINCreateHeader from '../../App/components/misc/PINCreateHeader'
import { BasicAppContext } from '../helpers/app'

describe('PINCreateHeader Component', () => {
  test('Renders correctly', async () => {
    const tree = render(
      <BasicAppContext>
        <PINCreateHeader />
      </BasicAppContext>
    )

    expect(tree).toMatchSnapshot()
  })
})
