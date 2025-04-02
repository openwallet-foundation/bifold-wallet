import { render, fireEvent } from '@testing-library/react-native'
import React from 'react'

import Link from '../../src/components/texts/Link'
import { testIdWithKey } from '../../src/utils/testable'

describe('Link Component', () => {
  test('Renders correctly, testID exists, and is pressable', async () => {
    const onPress = jest.fn()
    const tree = render(<Link linkText={'my link'} onPress={onPress} />)
    const link = tree.getByTestId(testIdWithKey('MyLink'))
    fireEvent(link, 'press')
    expect(onPress).toBeCalledTimes(1)
    expect(tree).toMatchSnapshot()
  })
})
