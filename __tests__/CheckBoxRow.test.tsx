import React from 'react'
import renderer from 'react-test-renderer'

import { CheckBoxRow } from '../App/components'

describe('CheckBoxRow Component', () => {
  it('Renders correctly', () => {
    const tree = renderer
      // @ts-ignore
      .create(<CheckBoxRow title={'Hello Fried'} accessibilityLabel={'Hey'} checked={true} onPress={() => {}} />)
      .toJSON()

    expect(tree).toMatchSnapshot()
  })
})
