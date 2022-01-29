import React from 'react'
import { create } from 'react-test-renderer'

import HighlightTextBox from '../../App/components/texts/HighlightTextBox'

jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon')

describe('InfoTextBox Component', () => {
  it('Renders correctly', () => {
    const tree = create(<HighlightTextBox>Hello World</HighlightTextBox>).toJSON()

    expect(tree).toMatchSnapshot()
  })
})
