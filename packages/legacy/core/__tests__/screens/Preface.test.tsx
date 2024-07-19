import { fireEvent, render } from '@testing-library/react-native'
import React from 'react'

import Preface from '../../App/screens/Preface'
import { testIdWithKey } from '../../App/utils/testable'

describe('Preface Screen', () => {
  test('Renders correctly', async () => {
    const tree = render(<Preface />)
    expect(tree).toMatchSnapshot()
  })

  test('Button enabled by checkbox being checked', async () => {
    const tree = render(<Preface />)
    const { getByTestId } = tree
    const checkbox = getByTestId(testIdWithKey('IAgree'))
    fireEvent(checkbox, 'press')
    expect(tree).toMatchSnapshot()
  })
})
