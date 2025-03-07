import { render, fireEvent } from '@testing-library/react-native'
import React from 'react'

import IconButton, { ButtonLocation } from '../../App/components/buttons/IconButton'
import { testIdWithKey } from '../../App/utils/testable'
import { BasicAppContext } from '../helpers/app'

describe('IconButton Component', () => {
  test('Left alignment renders correctly', () => {
    const tree = render(
      <IconButton
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
      <IconButton
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
      <BasicAppContext><IconButton
      buttonLocation={ButtonLocation.Right}
      accessibilityLabel={'RightButton'}
      testID={testIdWithKey('RightButton')}
      onPress={jest.fn()}
      text="RightButton"
      icon="information"
    /></BasicAppContext>
    )

    expect(tree).toMatchSnapshot()
  })

  test('Button onPress triggers on press', () => {
    const callback = jest.fn()
    const { getByTestId } = render(
      <IconButton
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
