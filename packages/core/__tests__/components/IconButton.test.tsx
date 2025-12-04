import { render, fireEvent } from '@testing-library/react-native'
import React from 'react'

import IconButton, { ButtonLocation } from '../../src/components/buttons/IconButton'
import { testIdWithKey } from '../../src/utils/testable'
import * as container from '../../src/container-api'

jest.mock('../../src/container-api', () => ({
  useServices: jest.fn(),
  TOKENS: {
    UTIL_LOGGER: 'UTIL_LOGGER',
  },
}))

describe('IconButton Component', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('Left alignment renders correctly', () => {
    const containerMock = jest.mocked(container)
    containerMock.useServices.mockReturnValue([{ warn: jest.fn() }] as any)

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
    const containerMock = jest.mocked(container)
    containerMock.useServices.mockReturnValue([{ warn: jest.fn() }] as any)

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
    const containerMock = jest.mocked(container)
    containerMock.useServices.mockReturnValue([{ warn: jest.fn() }] as any)

    const tree = render(
      <IconButton
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
    const containerMock = jest.mocked(container)
    containerMock.useServices.mockReturnValue([{ warn: jest.fn() }] as any)

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
