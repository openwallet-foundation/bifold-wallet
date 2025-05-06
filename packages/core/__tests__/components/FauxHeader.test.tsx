import { render } from '@testing-library/react-native'
import React from 'react'

import FauxHeader from '../../src/components/misc/FauxHeader'
import { BasicAppContext } from '../helpers/app'

describe('FauxHeader Component', () => {
  test('renders correctly', () => {
    const tree = render(
      <BasicAppContext>
        <FauxHeader title={'test'} onBackPressed={jest.fn()} />
      </BasicAppContext>
    )
    expect(tree).toMatchSnapshot()
  })
})