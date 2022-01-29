import React from 'react'
import { create } from 'react-test-renderer'

import CheckBoxRow from '../../App/components/inputs/CheckBoxRow'

jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon')

describe('CheckBoxRow Component', () => {
  it('Renders correctly', () => {
    const tree = create(
      // eslint-disable-next-line
      <CheckBoxRow title={'Hello Fried'} accessibilityLabel={'Hey'} checked={true} onPress={() => {}} />
    ).toJSON()

    expect(tree).toMatchSnapshot()
  })
})
