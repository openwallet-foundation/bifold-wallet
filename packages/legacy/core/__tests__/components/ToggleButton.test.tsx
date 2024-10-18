import { render, fireEvent } from '@testing-library/react-native'
import React from 'react'
import ToggleButton from '../../App/components/buttons/ToggleButton'

describe('ToggleButton Component', () => {
  const toggleActionMock = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders correctly when enabled', () => {
    const tree = render(
      <ToggleButton
        testID="toggle-button"
        isEnabled={true}
        isAvailable={true}
        toggleAction={toggleActionMock}
      />
    )
    expect(tree).toMatchSnapshot()
  })

  test('renders correctly when disabled', () => {
    const tree = render(
      <ToggleButton
        testID="toggle-button"
        isEnabled={false}
        isAvailable={true}
        toggleAction={toggleActionMock}
      />
    )
    expect(tree).toMatchSnapshot()
  })

  test('renders correctly when not available', () => {
    const tree = render(
      <ToggleButton
        testID="toggle-button"
        isEnabled={false}
        isAvailable={false}
        toggleAction={toggleActionMock}
      />
    )
    expect(tree).toMatchSnapshot()
  })

  test('calls toggleAction function when pressed and available', () => {
    const { getByTestId } = render(
      <ToggleButton
        testID="toggle-button"
        isEnabled={false}
        isAvailable={true}
        toggleAction={toggleActionMock}
      />
    )
    const toggle = getByTestId('toggle-button')
    fireEvent.press(toggle)
    expect(toggleActionMock).toHaveBeenCalled()
  })

  test('does not call toggleAction when unavailable', () => {
    const { getByTestId } = render(
      <ToggleButton
        testID="toggle-button"
        isEnabled={false}
        isAvailable={false}
        toggleAction={toggleActionMock}
      />
    )
    const toggle = getByTestId('toggle-button')
    fireEvent.press(toggle)
    expect(toggleActionMock).not.toHaveBeenCalled()
  })

  test('does not call toggleAction when disabled', () => {
    const { getByTestId } = render(
      <ToggleButton
        testID="toggle-button"
        isEnabled={false}
        isAvailable={true}
        toggleAction={toggleActionMock}
        disabled={true}
      />
    )
    const toggle = getByTestId('toggle-button')
    fireEvent.press(toggle)
    expect(toggleActionMock).not.toHaveBeenCalled()
  })

  test('renders custom icons correctly', () => {
    const { getByTestId } = render(
      <ToggleButton
        testID="toggle-button"
        isEnabled={true}
        isAvailable={true}
        toggleAction={toggleActionMock}
        enabledIcon="thumb-up"
        disabledIcon="thumb-down"
      />
    )
    const toggle = getByTestId('toggle-button')
    expect(toggle).toBeTruthy()
  })
})
