import { render } from '@testing-library/react-native'
import React from 'react'

import HeaderRight from '../../App/components/buttons/HeaderRight'

describe('Header Right Button Component', () => {
  test('Renders correctly', () => {
    const tree = render(
      <HeaderRight
        title={'Hello Header'}
        accessibilityLabel={'Hello'}
        onPress={() => {
          return
        }}
      />
    )

    expect(tree).toMatchSnapshot()
  })
})
