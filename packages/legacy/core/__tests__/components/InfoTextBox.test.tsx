import { render } from '@testing-library/react-native'
import React from 'react'

import InfoTextBox from '../../App/components/texts/InfoTextBox'
import { BasicAppContext } from '../helpers/app'

jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon')

describe('InfoTextBox Component', () => {
  test('Renders correctly', () => {
    const tree = render(
      <BasicAppContext>
        <InfoTextBox>Hello World</InfoTextBox>
      </BasicAppContext>
    )

    expect(tree).toMatchSnapshot()
  })
})
