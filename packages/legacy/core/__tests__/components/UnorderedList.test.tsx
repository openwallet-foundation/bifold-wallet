import { render } from '@testing-library/react-native'
import React from 'react'

import UnorderedList from '../../App/components/misc/UnorderedList'
import { BasicAppContext } from '../helpers/app'

describe('UnorderedList Component', () => {
  test('Renders correctly', () => {
    const content = ['item1', 'item2', 'item3']
    const tree = render(
      <BasicAppContext>
        <UnorderedList unorderedListItems={content} />
      </BasicAppContext>
    )

    expect(tree).toMatchSnapshot()
  })
})
