import { render } from '@testing-library/react-native'
import React from 'react'

import CheckBoxRow from '../../App/components/inputs/CheckBoxRow'
import { BasicAppContext } from '../helpers/app'

describe('CheckBoxRow Component', () => {
  test('Renders correctly', () => {
    const tree = render(
      // eslint-disable-next-line
      <BasicAppContext>
        <CheckBoxRow title={'Hello Friend'} accessibilityLabel={'Hey'} checked={true} onPress={() => {}} />
      </BasicAppContext>
    )

    expect(tree).toMatchSnapshot()
  })
})
