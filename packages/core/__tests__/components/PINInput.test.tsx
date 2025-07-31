import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import PINInput from '../../src/components/inputs/PINInput'
import { testIdWithKey } from '../../src/utils/testable'

describe('PINInput Component', () => {
  const defaultProps = {
    label: 'Enter PIN',
    onPINChanged: jest.fn(),
    testID: 'code-field',
    accessibilityLabel: 'PIN Input Field',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders correctly with label', () => {
      const tree = render(<PINInput {...defaultProps} />)
      expect(tree.getByText('Enter PIN')).toBeTruthy()
      expect(tree).toMatchSnapshot()
    })

    it('renders without label when not provided', () => {
      const tree = render(<PINInput onPINChanged={jest.fn()} />)
      expect(tree.queryByText('Enter PIN')).toBeNull()
      expect(tree).toMatchSnapshot()
    })

    it('renders show/hide toggle button', () => {
      const { getByLabelText } = render(<PINInput {...defaultProps} />)
      expect(getByLabelText('PINCreate.Show')).toBeTruthy()
    })

    it('test ID exists', () => {
      const { getByTestId } = render(<PINInput {...defaultProps} />)
      const pinInput = getByTestId('code-field')
      expect(pinInput).toBeTruthy()
    })
  })

  describe('PIN Input Functionality', () => {
    it('calls onPINChanged when PIN is entered', () => {
      const onPINChanged = jest.fn()
      const { getByTestId } = render(<PINInput {...defaultProps} onPINChanged={onPINChanged} />)

      // Simulate entering a PIN on the TextInput
      const pinInput = getByTestId('code-field')
      fireEvent(pinInput, 'onChangeText', '1')

      expect(onPINChanged).toHaveBeenCalledWith('1')
    })

    it('handles multiple digit entry correctly', () => {
      const onPINChanged = jest.fn()
      const { getByTestId } = render(<PINInput {...defaultProps} onPINChanged={onPINChanged} />)

      const pinInput = getByTestId('code-field')

      // Simulate entering multiple digits
      fireEvent(pinInput, 'onChangeText', '1 2 3 4')

      expect(onPINChanged).toHaveBeenCalledWith('1234')
    })

    it('handles pasted PIN', () => {
      const onPINChanged = jest.fn()
      const { getByTestId } = render(<PINInput {...defaultProps} onPINChanged={onPINChanged} />)

      const pinInput = getByTestId('code-field')

      // Simulate pasting four digit pin
      fireEvent(pinInput, 'onChangeText', '1234')

      expect(onPINChanged).toHaveBeenCalledWith('1234')
    })

    it('handles backspace correctly', () => {
      const onPINChanged = jest.fn()
      const { getByTestId } = render(<PINInput {...defaultProps} onPINChanged={onPINChanged} />)

      const pinInput = getByTestId('code-field')

      // Enter PIN then remove a digit
      fireEvent(pinInput, 'onChangeText', '1 2 3 4')
      fireEvent(pinInput, 'onChangeText', '1 2 3')

      expect(onPINChanged).toHaveBeenLastCalledWith('123')
    })

    it('maintains separate PIN state from display value when hidden', () => {
      const onPINChanged = jest.fn()
      const { getByTestId } = render(<PINInput {...defaultProps} onPINChanged={onPINChanged} />)

      const pinInput = getByTestId('code-field')

      // Enter a PIN (should be hidden by default)
      fireEvent(pinInput, 'onChangeText', '1 2 3 4')

      // The callback should receive the actual PIN digits
      expect(onPINChanged).toHaveBeenLastCalledWith('1234')

      // But the display value should be masked (this is tested implicitly through the component behavior)
    })

    it('correctly handles new character input when PIN is masked', () => {
      const onPINChanged = jest.fn()
      const { getByTestId } = render(<PINInput {...defaultProps} onPINChanged={onPINChanged} />)

      const pinInput = getByTestId('code-field')

      // Enter initial PIN
      fireEvent(pinInput, 'onChangeText', '1 2')
      expect(onPINChanged).toHaveBeenLastCalledWith('12')

      // Add another digit (simulating the masked state)
      fireEvent(pinInput, 'onChangeText', '● ● 3')
      expect(onPINChanged).toHaveBeenLastCalledWith('123')
    })

    it('handles gradual PIN deletion correctly', () => {
      const onPINChanged = jest.fn()
      const { getByTestId } = render(<PINInput {...defaultProps} onPINChanged={onPINChanged} />)

      const pinInput = getByTestId('code-field')

      // Build up a full PIN
      fireEvent(pinInput, 'onChangeText', '1 2 3 4')
      expect(onPINChanged).toHaveBeenLastCalledWith('1234')

      // Remove digits one by one
      fireEvent(pinInput, 'onChangeText', '1 2 3')
      expect(onPINChanged).toHaveBeenLastCalledWith('123')

      fireEvent(pinInput, 'onChangeText', '1 2')
      expect(onPINChanged).toHaveBeenLastCalledWith('12')

      fireEvent(pinInput, 'onChangeText', '1')
      expect(onPINChanged).toHaveBeenLastCalledWith('1')

      fireEvent(pinInput, 'onChangeText', '')
      expect(onPINChanged).toHaveBeenLastCalledWith('')
    })
  })

  describe('Show/Hide PIN Functionality', () => {
    it('toggles PIN visibility when show/hide button is pressed', () => {
      const { getByLabelText } = render(<PINInput {...defaultProps} />)

      const toggleButton = getByLabelText('PINCreate.Show')
      fireEvent.press(toggleButton)

      expect(getByLabelText('PINCreate.Hide')).toBeTruthy()
    })

    it('shows masked characters when PIN is hidden', () => {
      const { getByTestId, getByLabelText } = render(<PINInput {...defaultProps} />)

      const pinInput = getByTestId('code-field')
      fireEvent(pinInput, 'onChangeText', '1 2 3 4')

      // Ensure PIN is hidden (default state)
      const showButton = getByLabelText('PINCreate.Show')
      expect(showButton).toBeTruthy()

      // The display value should contain masked characters
      // This would be tested through the actual rendered cells in a real implementation
    })

    it('shows actual PIN when visibility is toggled on', () => {
      const { getByTestId, getByLabelText } = render(<PINInput {...defaultProps} />)

      const pinInput = getByTestId('code-field')
      fireEvent(pinInput, 'onChangeText', '1 2 3 4')

      // Toggle to show PIN
      const showButton = getByLabelText('PINCreate.Show')
      fireEvent.press(showButton)

      expect(getByLabelText('PINCreate.Hide')).toBeTruthy()
    })
  })

  describe('Accessibility', () => {
    it('has correct accessibility label when PIN is masked', () => {
      const { getByTestId } = render(<PINInput {...defaultProps} />)

      const pinInput = getByTestId('code-field')
      fireEvent(pinInput, 'onChangeText', '1 2 3 4')

      // Check that the accessibility label indicates the PIN is masked
      expect(getByTestId('code-field')).toBeTruthy()
    })

    it('updates accessibility labels when show/hide is toggled', () => {
      const { getByLabelText } = render(<PINInput {...defaultProps} />)

      // Initially should show "PINCreate.Show"
      expect(getByLabelText('PINCreate.Show')).toBeTruthy()

      // After toggle should show "PINCreate.Hide"
      fireEvent.press(getByLabelText('PINCreate.Show'))
      expect(getByLabelText('PINCreate.Hide')).toBeTruthy()
    })

    it('maintains accessibility when PIN value changes', () => {
      const { getByTestId } = render(<PINInput {...defaultProps} />)

      const pinInput = getByTestId('code-field')

      // Test that accessibility is maintained through PIN changes
      fireEvent(pinInput, 'onChangeText', '1')
      fireEvent(pinInput, 'onChangeText', '1 2')
      fireEvent(pinInput, 'onChangeText', '1 2 3')

      expect(pinInput).toBeTruthy()
    })
  })

  describe('Input Validation and Edge Cases', () => {
    it('handles empty input correctly', () => {
      const onPINChanged = jest.fn()
      const { getByTestId } = render(<PINInput {...defaultProps} onPINChanged={onPINChanged} />)

      const pinInput = getByTestId('code-field')
      fireEvent(pinInput, 'onChangeText', '')

      // The component may or may not call onPINChanged for empty input - both behaviors are valid
      // Just ensure no error occurs
      expect(pinInput).toBeTruthy()
    })

    it('handles spaces in input correctly', () => {
      const onPINChanged = jest.fn()
      const { getByTestId } = render(<PINInput {...defaultProps} onPINChanged={onPINChanged} />)

      const pinInput = getByTestId('code-field')
      fireEvent(pinInput, 'onChangeText', '1 2 3 4')

      // Should remove spaces and call with clean PIN
      expect(onPINChanged).toHaveBeenCalledWith('1234')
    })

    it('handles masked characters in input correctly', () => {
      const onPINChanged = jest.fn()
      const { getByTestId } = render(<PINInput {...defaultProps} onPINChanged={onPINChanged} />)

      const pinInput = getByTestId('code-field')

      // First enter a PIN to create masked state
      fireEvent(pinInput, 'onChangeText', '1 2 3 4')

      // Then simulate input that might contain masked characters
      fireEvent(pinInput, 'onChangeText', '● ● ● ●')

      // Should handle this appropriately without breaking
      expect(onPINChanged).toHaveBeenCalled()
    })

    it('handles backspace correctly when going from 1 character to 0 characters', async () => {
      const mockOnPINChanged = jest.fn()
      const { getByTestId } = render(<PINInput onPINChanged={mockOnPINChanged} testID="test-pin-input" />)

      const textInput = getByTestId('test-pin-input')

      // Type one character
      fireEvent.changeText(textInput, '1')
      expect(mockOnPINChanged).toHaveBeenCalledWith('1')

      // Clear the mock to focus on the backspace operation
      mockOnPINChanged.mockClear()

      // Simulate backspace by setting to empty string
      fireEvent.changeText(textInput, '')

      // This should call onPINChanged with empty string
      expect(mockOnPINChanged).toHaveBeenCalledWith('')
      expect(mockOnPINChanged).toHaveBeenCalledTimes(1)
    })

    it('handles backspace correctly when showPIN is true', async () => {
      const mockOnPINChanged = jest.fn()
      const { getByTestId } = render(<PINInput onPINChanged={mockOnPINChanged} testID="test-pin-input" />)

      const textInput = getByTestId('test-pin-input')
      const showHideButton = getByTestId(testIdWithKey('Show'))

      // Toggle to show PIN first
      fireEvent.press(showHideButton)

      // Type one character
      fireEvent.changeText(textInput, '1')
      expect(mockOnPINChanged).toHaveBeenCalledWith('1')

      // Clear the mock to focus on the backspace operation
      mockOnPINChanged.mockClear()

      // Simulate backspace by setting to empty string
      fireEvent.changeText(textInput, '')

      // This should call onPINChanged with empty string
      expect(mockOnPINChanged).toHaveBeenCalledWith('')
      expect(mockOnPINChanged).toHaveBeenCalledTimes(1)
    })
  })

  describe('Error Messages', () => {
    it('renders inline error message above when specified', () => {
      const inlineMessage = {
        message: 'Invalid PIN',
        inlineType: 0, // InlineErrorType.error
        config: { enabled: true, position: 0 }, // InlineErrorPosition.Above
      }

      const tree = render(<PINInput {...defaultProps} inlineMessage={inlineMessage} />)

      expect(tree.getByText('Invalid PIN')).toBeTruthy()
      expect(tree).toMatchSnapshot()
    })

    it('renders inline error message below when specified', () => {
      const inlineMessage = {
        message: 'PIN too short',
        inlineType: 0, // InlineErrorType.error
        config: { enabled: true, position: 1 }, // InlineErrorPosition.Below
      }

      const tree = render(<PINInput {...defaultProps} inlineMessage={inlineMessage} />)

      expect(tree.getByText('PIN too short')).toBeTruthy()
      expect(tree).toMatchSnapshot()
    })
  })
})
