import { render, fireEvent, act, waitFor } from '@testing-library/react-native'
import React from 'react'
import ToggleButton from '../../src/components/buttons/ToggleButton'

const animationDuration = 200

describe('ToggleButton Component', () => {
  const toggleActionMock = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders correctly when enabled', async () => {
    const tree = render(
      <ToggleButton testID="toggle-button" isEnabled={true} isAvailable={true} toggleAction={toggleActionMock} />
    )
    await waitFor(async () => {
      await new Promise((resolve) => setTimeout(resolve, animationDuration))
      expect(tree).toMatchSnapshot()
    })
  })

  test('renders correctly when disabled', async () => {
    const tree = render(
      <ToggleButton testID="toggle-button" isEnabled={false} isAvailable={true} toggleAction={toggleActionMock} />
    )
    await waitFor(async () => {
      await new Promise((resolve) => setTimeout(resolve, animationDuration))
      expect(tree).toMatchSnapshot()
    })
  })

  test('renders correctly when not available', async () => {
    const tree = render(
      <ToggleButton testID="toggle-button" isEnabled={false} isAvailable={false} toggleAction={toggleActionMock} />
    )
    await waitFor(async () => {
      await new Promise((resolve) => setTimeout(resolve, animationDuration))
      expect(tree).toMatchSnapshot()
    })
  })

  test('calls toggleAction function when pressed and available', async () => {
    const { getByTestId } = render(
      <ToggleButton testID="toggle-button" isEnabled={false} isAvailable={true} toggleAction={toggleActionMock} />
    )
    const toggle = getByTestId('toggle-button')
    await act(async () => {
      fireEvent.press(toggle)
      await new Promise((resolve) => setTimeout(resolve, animationDuration))
    })
    expect(toggleActionMock).toHaveBeenCalled()
  })

  test('does not call toggleAction when unavailable', async () => {
    const { getByTestId } = render(
      <ToggleButton testID="toggle-button" isEnabled={false} isAvailable={false} toggleAction={toggleActionMock} />
    )
    const toggle = getByTestId('toggle-button')
    await act(async () => {
      fireEvent.press(toggle)
      await new Promise((resolve) => setTimeout(resolve, animationDuration))
    })
    expect(toggleActionMock).not.toHaveBeenCalled()
  })

  test('does not call toggleAction when disabled', async () => {
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
    await act(async () => {
      fireEvent.press(toggle)
      await new Promise((resolve) => setTimeout(resolve, animationDuration))
    })
    expect(toggleActionMock).not.toHaveBeenCalled()
  })

  test('renders custom icons correctly', async () => {
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
    await waitFor(async () => {
      await new Promise((resolve) => setTimeout(resolve, animationDuration))
      const toggle = getByTestId('toggle-button')
      expect(toggle).toBeTruthy()
    })
  })
})
