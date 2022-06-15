import { render } from '@testing-library/react-native'
import React from 'react'

import PinCreate from '../../App/screens/PinCreate'

jest.mock('react-native-keychain', () => {
  return {
    setGenericPassword: jest.fn(),
  }
})

describe('displays a pin create screen', () => {
  test('pin create renders correctly', () => {
    const tree = render(<PinCreate setAuthenticated={jest.fn()} />)
    expect(tree).toMatchSnapshot()
  })
})
