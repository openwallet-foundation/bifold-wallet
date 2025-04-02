import { render } from '@testing-library/react-native'
import React from 'react'

import UnorderedList from '../../src/components/misc/UnorderedList'

describe('UnorderedList Component', () => {
  test('Renders correctly', () => {
    const content = ['item1', 'item2', 'item3']
    const tree = render(<UnorderedList unorderedListItems={content} />)

    expect(tree).toMatchSnapshot()
  })
})
