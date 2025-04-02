import { fireEvent, render, screen } from '@testing-library/react-native'
import React from 'react'

import PINExplainer from '../../src/screens/PINExplainer'
import { testIdWithKey } from '../../src/utils/testable'

describe('PINExplainer Screen', () => {
  const continueCreatePIN = jest.fn()

  test('Renders correctly', async () => {
    const tree = render(<PINExplainer continueCreatePIN={continueCreatePIN} />)
    expect(tree).toMatchSnapshot()
  })

  test('Button exists and works', async () => {
    render(<PINExplainer continueCreatePIN={continueCreatePIN} />)

    const continueButton = await screen.findByTestId(testIdWithKey('ContinueCreatePIN'))
    fireEvent(continueButton, 'press')

    expect(continueCreatePIN).toHaveBeenCalled()
  })
})
