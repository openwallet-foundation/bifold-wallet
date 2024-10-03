import { render, fireEvent } from '@testing-library/react-native'
import React from 'react'

import ButtonWithIcon, { ButtonLocation } from '../../App/components/buttons/ButtonWithIcon'
import { testIdWithKey } from '../../App/utils/testable'

describe('ButtonWithIcon Component', () => {
  test('Left alignment renders correctly', () => {
    const tree = render(
      <ButtonWithIcon
        buttonLocation={ButtonLocation.Left}
        accessibilityLabel={'LeftButton'}
        testID={testIdWithKey('LeftButton')}
        onPress={jest.fn()}
        icon="information"
      />
    )

    expect(tree).toMatchSnapshot()
  })

  test('Right alignment renders correctly', () => {
    const tree = render(
      <ButtonWithIcon
        buttonLocation={ButtonLocation.Right}
        accessibilityLabel={'RightButton'}
        testID={testIdWithKey('RightButton')}
        onPress={jest.fn()}
        icon="information"
      />
    )

    expect(tree).toMatchSnapshot()
  })

  test('Right alignment with text renders correctly', () => {
    const tree = render(
      <ButtonWithIcon
        buttonLocation={ButtonLocation.Right}
        accessibilityLabel={'RightButton'}
        testID={testIdWithKey('RightButton')}
        onPress={jest.fn()}
        text="RightButton"
        icon="information"
      />
    )

    expect(tree).toMatchSnapshot()
  })

  test('Button onPress triggers on press', () => {
    const callback = jest.fn()
    const { getByTestId } = render(
      <ButtonWithIcon
        buttonLocation={ButtonLocation.Left}
        accessibilityLabel={'LeftButton'}
        testID={testIdWithKey('LeftButton')}
        onPress={callback}
        icon="information"
      />
    )

    const button = getByTestId(testIdWithKey('LeftButton'))

    fireEvent(button, 'press')

    expect(callback).toHaveBeenCalledTimes(1)
  })
})
