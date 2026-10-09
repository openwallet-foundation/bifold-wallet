import { render, screen } from '@testing-library/react-native'
import React from 'react'
import { StyleSheet } from 'react-native'
import type { ReactTestRendererJSON } from 'react-test-renderer'

// eslint-disable-next-line import/no-named-as-default
import Button, { ButtonType } from '../../src/components/buttons/Button'
import ButtonLoading from '../../src/components/animated/ButtonLoading'
import { bifoldTheme } from '../../src/theme'
import { testIdWithKey } from '../../src/utils/testable'

describe('Button Component', () => {
  test('Primary renders correctly', () => {
    const tree = render(
      <Button
        title={'Hello Primary'}
        accessibilityLabel={'primary'}
        onPress={() => {
          return
        }}
        buttonType={ButtonType.Primary}
      />
    )

    expect(tree).toMatchSnapshot()
  })

  test('Secondary renders correctly', () => {
    const tree = render(
      <Button
        title={'Hello Secondary'}
        accessibilityLabel={'secondary'}
        onPress={() => {
          return
        }}
        buttonType={ButtonType.Secondary}
      />
    )

    expect(tree).toMatchSnapshot()
  })

  describe('with a loading spinner child', () => {
    const { TextTheme, Buttons, Spacing } = bifoldTheme

    const renderButton = (buttonType: ButtonType, disabled = false) => (
      <Button
        title={'Loading'}
        accessibilityLabel={'loading'}
        onPress={jest.fn()}
        buttonType={buttonType}
        disabled={disabled}
      >
        <ButtonLoading />
      </Button>
    )

    const spinnerColor = () => StyleSheet.flatten(screen.getByTestId(testIdWithKey('Loading')).props.style).color
    const labelColor = () => StyleSheet.flatten(screen.getByText('Loading').props.style).color

    test.each([
      ['Primary', ButtonType.Primary, false],
      ['Primary disabled', ButtonType.Primary, true],
      ['Secondary', ButtonType.Secondary, false],
      ['Critical', ButtonType.Critical, false],
    ])('%s spinner matches the label colour', (_name, buttonType, disabled) => {
      render(renderButton(buttonType, disabled))

      expect(spinnerColor()).toBeTruthy()
      expect(spinnerColor()).toBe(labelColor())
    })

    test('spinner follows the label colour when the button is disabled and re-enabled', () => {
      const { rerender } = render(renderButton(ButtonType.Secondary))
      const enabledColor = spinnerColor()
      expect(enabledColor).toBe(StyleSheet.flatten([TextTheme.normal, Buttons.secondaryText]).color)

      rerender(renderButton(ButtonType.Secondary, true))
      const disabledColor = spinnerColor()
      expect(disabledColor).toBe(labelColor())
      expect(disabledColor).not.toBe(enabledColor)

      rerender(renderButton(ButtonType.Secondary))
      expect(spinnerColor()).toBe(enabledColor)
    })

    test('spinner is 24px with Spacing.sm between it and the label', () => {
      render(renderButton(ButtonType.Primary))

      expect(StyleSheet.flatten(screen.getByTestId(testIdWithKey('Loading')).props.style).fontSize).toBe(24)
      expect(StyleSheet.flatten(screen.getByTestId(testIdWithKey('ButtonLoading')).props.style).marginRight).toBe(
        Spacing.sm
      )
    })

    test('spinner precedes the label', () => {
      render(renderButton(ButtonType.Primary))

      const button = screen.toJSON() as ReactTestRendererJSON
      const row = button.children?.[0] as ReactTestRendererJSON
      const [first, second] = row.children as ReactTestRendererJSON[]
      expect(first.props.testID).toBe(testIdWithKey('ButtonLoading'))
      expect(second.children).toEqual(['Loading'])
    })
  })

  test('ButtonLoading outside a Button falls back to the brand icon colour', () => {
    render(<ButtonLoading />)

    expect(StyleSheet.flatten(screen.getByTestId(testIdWithKey('Loading')).props.style).color).toBe(
      bifoldTheme.ColorPalette.brand.icon
    )
  })
})
