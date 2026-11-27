import { render } from '@testing-library/react-native'
import React from 'react'
import { Platform } from 'react-native'
import QRCode from 'react-native-qrcode-svg'

import QRRenderer from '../../src/components/misc/QRRenderer'
import { useInvertColorsEnabled } from '../../src/hooks/useInvertColorsEnabled'
import { testIdWithKey } from '../../src/utils/testable'
import { BasicAppContext } from '../helpers/app'

jest.mock('../../src/hooks/useInvertColorsEnabled', () => ({
  useInvertColorsEnabled: jest.fn(),
}))

const value = 'https://example.com/invitation?oob=abc123'
const containerTestId = testIdWithKey('QRRenderer')

describe('QRRenderer', () => {
  const originalPlatform = Platform.OS

  beforeEach(() => {
    jest.mocked(useInvertColorsEnabled).mockReturnValue(false)
  })

  afterEach(() => {
    Platform.OS = originalPlatform
  })

  const renderCode = () =>
    render(
      <BasicAppContext>
        <QRRenderer value={value} size={200} />
      </BasicAppContext>
    )

  test('draws the code black on white', () => {
    const { getByTestId, UNSAFE_getByType } = renderCode()

    expect(getByTestId(containerTestId)).toHaveStyle({ backgroundColor: 'white' })
    expect(UNSAFE_getByType(QRCode).props).toMatchObject({
      value,
      size: 200,
      color: 'black',
      backgroundColor: 'white',
    })
  })

  describe('on iOS', () => {
    beforeEach(() => {
      Platform.OS = 'ios'
    })

    test('opts the code out of Smart Invert, as a view the renderer keeps', () => {
      const { getByTestId } = renderCode()

      expect(getByTestId(containerTestId).props).toMatchObject({
        accessibilityIgnoresInvertColors: true,
        collapsable: false,
      })
    })

    test('does not redraw the code when inversion is reported on', () => {
      jest.mocked(useInvertColorsEnabled).mockReturnValue(true)

      const { getByTestId, UNSAFE_getByType } = renderCode()

      expect(getByTestId(containerTestId)).toHaveStyle({ backgroundColor: 'white' })
      expect(UNSAFE_getByType(QRCode).props).toMatchObject({ color: 'black', backgroundColor: 'white' })
    })
  })

  describe('on Android', () => {
    beforeEach(() => {
      Platform.OS = 'android'
    })

    test('draws the code black on white while colour inversion is off', () => {
      const { getByTestId, UNSAFE_getByType } = renderCode()

      expect(getByTestId(containerTestId)).toHaveStyle({ backgroundColor: 'white' })
      expect(UNSAFE_getByType(QRCode).props).toMatchObject({ color: 'black', backgroundColor: 'white' })
    })

    test('draws the code inverted while colour inversion is on, so the display turns it back', () => {
      jest.mocked(useInvertColorsEnabled).mockReturnValue(true)

      const { getByTestId, UNSAFE_getByType } = renderCode()

      expect(getByTestId(containerTestId)).toHaveStyle({ backgroundColor: 'black' })
      expect(UNSAFE_getByType(QRCode).props).toMatchObject({ color: 'white', backgroundColor: 'black' })
    })
  })
})
