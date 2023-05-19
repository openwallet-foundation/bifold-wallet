import { render } from '@testing-library/react-native'
import React from 'react'

// eslint-disable-next-line import/no-named-as-default
import HeaderButton, { ButtonLocation } from '../../App/components/buttons/HeaderButton'
import { testIdWithKey } from '../../App/utils/testable'

describe('HeaderButton Component', () => {
  test('Left alignment renders correctly', () => {
    const tree = render(
      <HeaderButton
        buttonLocation={ButtonLocation.Left}
        accessibilityLabel={'LeftButton'}
        testID={testIdWithKey('LeftButton')}
        onPress={() => {
          return
        }}
        icon="information"
      />
    )

    expect(tree).toMatchSnapshot()
  })

  test('Right alignment renders correctly', () => {
    const tree = render(
      <HeaderButton
        buttonLocation={ButtonLocation.Right}
        accessibilityLabel={'RightButton'}
        testID={testIdWithKey('RightButton')}
        onPress={() => {
          return
        }}
        icon="information"
      />
    )

    expect(tree).toMatchSnapshot()
  })

  test('Right alignment with text renders correctly', () => {
    const tree = render(
      <HeaderButton
        buttonLocation={ButtonLocation.Right}
        accessibilityLabel={'RightButton'}
        testID={testIdWithKey('RightButton')}
        onPress={() => {
          return
        }}
        text="RightButton"
        icon="information"
      />
    )

    expect(tree).toMatchSnapshot()
  })
})
