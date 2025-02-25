import { render, fireEvent } from '@testing-library/react-native'
import React from 'react'

import Link from '../../App/components/texts/Link'
import { testIdWithKey } from '../../App/utils/testable'
import { BasicAppContext } from '../helpers/app'

describe('Link Component', () => {
  test('Renders correctly, testID exists, and is pressable', async () => {
    const onPress = jest.fn()
    const tree = render(
      <BasicAppContext>
        <Link linkText={'my link'} onPress={onPress} />
      </BasicAppContext>
    )
    const link = tree.getByTestId(testIdWithKey('MyLink'))
    fireEvent(link, 'press')
    expect(onPress).toBeCalledTimes(1)
    expect(tree).toMatchSnapshot()
  })
})
