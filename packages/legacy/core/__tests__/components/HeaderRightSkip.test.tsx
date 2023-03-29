import { render } from '@testing-library/react-native'
import React from 'react'

import HeaderRightSkip from '../../App/components/buttons/HeaderRightSkip'

describe('Header Right Button Component', () => {
  test('Renders correctly', () => {
    const tree = render(
      <HeaderRightSkip
        title={'Hello Header'}
        testID={'TestID.Button'}
        accessibilityLabel={'Hello'}
        onPress={() => {
          return
        }}
      />
    )

    expect(tree).toMatchSnapshot()
  })
})
