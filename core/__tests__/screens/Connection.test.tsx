import { NavigationContext } from '@react-navigation/native'
import { render, waitFor, fireEvent } from '@testing-library/react-native'
import React from 'react'

import ConnectionModal from '../../App/screens/Connection'
import { testIdWithKey } from '../../App/utils/testable'
import timeTravel from '../util/timetravel'

jest.useFakeTimers('legacy')
jest.spyOn(global, 'setTimeout')

const props = { params: { connectionId: '123' } }
const createNavigationContext = () => {
  const actualNav = jest.requireActual('@react-navigation/native')
  const navigate = jest.fn()
  const navContext = {
    ...actualNav.navigation,
    navigate: navigate,
    dangerouslyGetState: () => {},
    setOptions: () => {},
    addListener: () => () => {},
    isFocused: () => true,
    getParent: () => {
      return navContext
    },
  }
  return navContext
}

describe('ConnectionModal Component', () => {
  test('Renders correctly', async () => {
    const navContext = createNavigationContext()
    const element = (
      <NavigationContext.Provider value={navContext}>
        <ConnectionModal navigation={navContext} route={props as any} />
      </NavigationContext.Provider>
    )
    const tree = render(element)
    const backHomeBtn = tree.queryByTestId(testIdWithKey('BackToHome'))

    expect(tree).toMatchSnapshot()
    expect(backHomeBtn).toBeNull()
  })

  test('Updates after delay', async () => {
    const navContext = createNavigationContext()
    const element = (
      <NavigationContext.Provider value={navContext}>
        <ConnectionModal navigation={navContext} route={props as any} />
      </NavigationContext.Provider>
    )
    const tree = render(element)

    await waitFor(() => {
      timeTravel(10000)
    })

    expect(tree).toMatchSnapshot()
  })

  test('Dismiss on demand', async () => {
    const navContext = createNavigationContext()
    const element = (
      <NavigationContext.Provider value={navContext}>
        <ConnectionModal navigation={navContext} route={props as any} />
      </NavigationContext.Provider>
    )
    const tree = render(element)

    await waitFor(() => {
      timeTravel(10000)
    })

    const backHomeBtn = tree.getByTestId(testIdWithKey('BackToHome'))
    fireEvent(backHomeBtn, 'press')

    expect(tree).toMatchSnapshot()
  })
})
