import { fireEvent, render } from '@testing-library/react-native'
import React from 'react'

import ScanTab from '../../App/components/misc/ScanTab'
import { testIdWithKey } from '../../App/utils/testable'

describe('ScanTab Component', () => {
  test('Renders correctly', () => {
    const title = 'title'
    const callback = jest.fn()
    const tree = render(<ScanTab title={title} iconName={'crop-free'} onPress={() => callback()} active={true} />)

    expect(tree).toMatchSnapshot()
  })

  test('Tapping triggers callback', () => {
    const title = 'title'
    const callback = jest.fn()
    const { getByTestId } = render(
      <ScanTab title={title} iconName={'crop-free'} onPress={() => callback()} active={true} />
    )
    const pressable = getByTestId(testIdWithKey(title))
    fireEvent(pressable, 'press')
    expect(callback).toHaveBeenCalled()
  })
})
