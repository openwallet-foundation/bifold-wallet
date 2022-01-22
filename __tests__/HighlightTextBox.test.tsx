import React from 'react'
import renderer from 'react-test-renderer'

import HighlightTextBox from '../App/components/texts/HighlightTextBox'

jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon')

describe('InfoTextBox Component', () => {
  it('Renders correctly', () => {
    const tree = renderer
      // @ts-ignore
      .create(<HighlightTextBox text="Hello World" />)
      .toJSON()

    expect(tree).toMatchSnapshot()
  })
})
