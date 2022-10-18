import { render } from '@testing-library/react-native'
import React from 'react'

import HeaderLeftBack from '../../src/components/buttons/HeaderLeftBack'

describe('Header Left Button Component', () => {
  test('Renders correctly', () => {
    const tree = render(
      <HeaderLeftBack
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
