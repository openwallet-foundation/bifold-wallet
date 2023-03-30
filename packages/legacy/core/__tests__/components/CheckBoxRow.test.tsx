import { render } from '@testing-library/react-native'
import React from 'react'

import CheckBoxRow from '../../App/components/inputs/CheckBoxRow'

describe('CheckBoxRow Component', () => {
  test('Renders correctly', () => {
    const tree = render(
      // eslint-disable-next-line
      <CheckBoxRow title={'Hello Friend'} accessibilityLabel={'Hey'} checked={true} onPress={() => {}} />
    )

    expect(tree).toMatchSnapshot()
  })
})
