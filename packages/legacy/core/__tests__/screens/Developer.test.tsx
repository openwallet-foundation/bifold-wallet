import { render } from '@testing-library/react-native'
import React from 'react'

import Developer from '../../App/screens/Developer'
import { testIdWithKey } from '../../App/utils/testable'

describe('Developer screen', () => {
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
    const tree = render(<Developer />)

    expect(tree).toMatchSnapshot()
  })

  test('pressables exist', async () => {
    const { findByTestId } = render(<Developer />)

    const VerifierToggle = await findByTestId(testIdWithKey('ToggleVerifierCapability'))
    const ConnectionToggle = await findByTestId(testIdWithKey('ToggleConnectionInviterCapabilitySwitch'))

    expect(VerifierToggle).not.toBe(null)
    expect(ConnectionToggle).not.toBe(null)
  })
})
