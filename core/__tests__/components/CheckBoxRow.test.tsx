import React from 'react'
import { create } from 'react-test-renderer'

import CheckBoxRow from '../../App/components/inputs/CheckBoxRow'

describe('CheckBoxRow Component', () => {
  it('Renders correctly', () => {
    const tree = create(
      // eslint-disable-next-line
      <CheckBoxRow title={'Hello Friend'} accessibilityLabel={'Hey'} checked={true} onPress={() => {}} />
    ).toJSON()

    expect(tree).toMatchSnapshot()
  })
})
