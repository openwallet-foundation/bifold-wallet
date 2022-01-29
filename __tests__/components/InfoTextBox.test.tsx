import React from 'react'
import { create } from 'react-test-renderer'

import InfoTextBox from '../../App/components/texts/InfoTextBox'

jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon')

describe('InfoTextBox Component', () => {
  it('Renders correctly', () => {
    const tree = create(<InfoTextBox>Hello World</InfoTextBox>).toJSON()

    expect(tree).toMatchSnapshot()
  })
})
