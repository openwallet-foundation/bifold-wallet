import { render } from '@testing-library/react-native'
import React from 'react'

import PINHeader from '../../src/components/misc/PINHeader'
import { BasicAppContext } from '../helpers/app'

describe('PINHeader Component', () => {
  test('Renders correctly', async () => {
    const tree = render(
      <BasicAppContext>
        <PINHeader />
      </BasicAppContext>
    )

    expect(tree).toMatchSnapshot()
  })

  test('Renders correctly for change pin', async () => {
    const tree = render(
      <BasicAppContext>
        <PINHeader updatePin />
      </BasicAppContext>
    )

    expect(tree).toMatchSnapshot()
  })
})
