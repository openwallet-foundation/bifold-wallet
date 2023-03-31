import { render, fireEvent } from '@testing-library/react-native'
import React from 'react'

import FauxNavigationBar from '../../App/components/views/FauxNavigationBar'
import { testIdWithKey } from '../../App/utils/testable'

describe('Faux Navigation Bar Component', () => {
  test('Renders without home icon', () => {
    const tree = render(<FauxNavigationBar title={'Hello'} />)

    expect(tree).toMatchSnapshot()
  })

  test('Renders with home icon', () => {
    const cb = jest.fn()
    const tree = render(<FauxNavigationBar title={'Hello'} onHomeTouched={cb} />)

    expect(tree).toMatchSnapshot()
  })

  test('Home button triggers callback as expected', () => {
    const cb = jest.fn()
    const tree = render(<FauxNavigationBar title={'Hello'} onHomeTouched={cb} />)
    const homeButton = tree.getByTestId(testIdWithKey('HomeButton'))

    fireEvent(homeButton, 'press')

    expect(homeButton).not.toBeNull()
    expect(cb).toBeCalledTimes(1)
  })
})
