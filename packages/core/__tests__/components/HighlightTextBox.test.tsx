import { render } from '@testing-library/react-native'
import React from 'react'

import HighlightTextBox from '../../src/components/texts/HighlightTextBox'

jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon')

describe('HighlightTextBox Component', () => {
  test('Renders correctly', () => {
    const tree = render(<HighlightTextBox>Hello World</HighlightTextBox>)

    expect(tree).toMatchSnapshot()
  })
})
