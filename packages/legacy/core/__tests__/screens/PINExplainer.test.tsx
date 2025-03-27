import { fireEvent, render, screen } from '@testing-library/react-native'
import React from 'react'

import PINExplainer from '../../App/screens/PINExplainer'
import { testIdWithKey } from '../../App/utils/testable'
import { BasicAppContext } from '../helpers/app'

describe('PINExplainer Screen', () => {
  const continueCreatePIN = jest.fn()

  test('Renders correctly', async () => {
    const tree = render(
      <BasicAppContext>
        <PINExplainer continueCreatePIN={continueCreatePIN} />
      </BasicAppContext>
    )
    expect(tree).toMatchSnapshot()
  })

  test('Button exists and works', async () => {
    render(
      <BasicAppContext>
        <PINExplainer continueCreatePIN={continueCreatePIN} />
      </BasicAppContext>
    )

    const continueButton = await screen.findByTestId(testIdWithKey('ContinueCreatePIN'))
    fireEvent(continueButton, 'press')

    expect(continueCreatePIN).toHaveBeenCalled()
  })
})
