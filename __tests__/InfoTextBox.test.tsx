import React from 'react'
import renderer from 'react-test-renderer'

import InfoTextBox from '../App/components/texts/InfoTextBox'

jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon')

describe('InfoTextBox Component', () => {
  it('Renders correctly', () => {
    const tree = renderer
      // @ts-ignore
      .create(<InfoTextBox text="Hello World" />)
      .toJSON()

    expect(tree).toMatchSnapshot()
  })
})
