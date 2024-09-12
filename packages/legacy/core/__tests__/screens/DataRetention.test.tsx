import { render } from '@testing-library/react-native'
import React from 'react'

import DataRetention from '../../App/screens/DataRetention'
import { testIdWithKey } from '../../App/utils/testable'

describe('DataRetention Screen', () => {
  beforeEach(() => {
    // Silence console.error because it will print a warning about Switch
    // "Warning: dispatchCommand was called with a ref ...".
    jest.spyOn(console, 'error').mockImplementation(() => {
      return null
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('screen renders correctly', () => {
    const tree = render(<DataRetention />)

    expect(tree).toMatchSnapshot()
  })

  test('pressables exist', async () => {
    const { findByTestId } = render(<DataRetention />)

    const OnButton = await findByTestId(testIdWithKey('dataRetentionOn'))
    const OffButton = await findByTestId(testIdWithKey('dataRetentionOff'))

    expect(OnButton).not.toBe(null)
    expect(OffButton).not.toBe(null)
  })
})
