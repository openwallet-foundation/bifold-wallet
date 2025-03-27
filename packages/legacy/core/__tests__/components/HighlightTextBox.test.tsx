import { render } from '@testing-library/react-native'
import React from 'react'

import HighlightTextBox from '../../App/components/texts/HighlightTextBox'
import { BasicAppContext } from '../helpers/app'

jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon')

describe('HighlightTextBox Component', () => {
  test('Renders correctly', () => {
    const tree = render(
      <BasicAppContext>
        <HighlightTextBox>Hello World</HighlightTextBox>
      </BasicAppContext>
    )

    expect(tree).toMatchSnapshot()
  })
})
