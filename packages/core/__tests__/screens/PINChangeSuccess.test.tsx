import React from 'react'
import { render, fireEvent, act } from '@testing-library/react-native'

import ChangePINSuccessScreen from '../../src/screens/PINChangeSuccess'
import { BasicAppContext } from '../helpers/app'
import { testIdWithKey } from '../../src/utils/testable'
import { Screens } from '../../src/types/navigators'

describe('ChangePINSuccess Screen', () => {
  const mockNavigate = jest.fn()
  const mockNavigation = {
    getParent: () => ({
      navigate: mockNavigate,
    }),
    navigate: mockNavigate,
  } as any

  test('Renders correctly', async () => {
    const tree = render(
      <BasicAppContext>
        <ChangePINSuccessScreen route={{} as any} navigation={jest.fn() as any} />
      </BasicAppContext>
    )
    expect(tree).toMatchSnapshot()
  })

  test('Navigate is called with Settings Screen on "Go To Settings" press', async () => {
    const tree = render(
      <BasicAppContext>
        <ChangePINSuccessScreen route={{} as any} navigation={mockNavigation} />
      </BasicAppContext>
    )

    const primaryCTA = tree.getByTestId(testIdWithKey('GoToSettings'))

    await act(async () => {
      fireEvent.press(primaryCTA)
    })

    expect(mockNavigate).toHaveBeenCalledWith(Screens.Settings)
  })
})
