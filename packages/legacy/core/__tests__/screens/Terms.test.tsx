import { fireEvent, render } from '@testing-library/react-native'
import React from 'react'

import Terms from '../../App/screens/Terms'
import { testIdWithKey } from '../../App/utils/testable'

jest.mock('@react-navigation/core', () => {
  return require('../../__mocks__/custom/@react-navigation/core')
})
jest.mock('@react-navigation/native', () => {
  return require('../../__mocks__/custom/@react-navigation/native')
})

describe('Terms Screen', () => {
  test('Renders correctly', async () => {
    const tree = render(<Terms />)
    expect(tree).toMatchSnapshot()
  })

  test('Button enabled by checkbox being checked', async () => {
    const tree = render(<Terms />)
    const { getByTestId } = tree
    const checkbox = getByTestId(testIdWithKey('IAgree'))
    fireEvent(checkbox, 'press')
    expect(tree).toMatchSnapshot()
  })
})
