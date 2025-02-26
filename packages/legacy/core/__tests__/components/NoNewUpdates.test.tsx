import { render } from '@testing-library/react-native'
import React from 'react'

import NoNewUpdates from '../../App/components/misc/NoNewUpdates'
import { BasicAppContext } from '../helpers/app'

jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon')

describe('NoNewUpdates Component', () => {
  test('Renders correctly', () => {
    const tree = render(
      <BasicAppContext>
        <NoNewUpdates />
      </BasicAppContext>
    )

    expect(tree).toMatchSnapshot()
  })
})
