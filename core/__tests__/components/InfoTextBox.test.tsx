import { render } from '@testing-library/react-native'
import React from 'react'

import InfoTextBox from '../../App/components/texts/InfoTextBox'

jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon')

describe('InfoTextBox Component', () => {
  test('Renders correctly', () => {
    const tree = render(<InfoTextBox>Hello World</InfoTextBox>)

    expect(tree).toMatchSnapshot()
  })
})
