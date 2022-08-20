import { NavigationContext } from '@react-navigation/native'
import { render, waitFor, fireEvent } from '@testing-library/react-native'
import React from 'react'

import ConnectionModal from '../../App/screens/Connection'
import { testIdWithKey } from '../../App/utils/testable'
import navigationContext from '../contexts/navigation'
import timeTravel from '../util/timetravel'

jest.useFakeTimers('legacy')
jest.spyOn(global, 'setTimeout')

const props = { params: { connectionId: '123' } }

describe('ConnectionModal Component', () => {
  test('Renders correctly', async () => {
    const element = (
      <NavigationContext.Provider value={navigationContext}>
        <ConnectionModal navigation={navigationContext} route={props as any} />
      </NavigationContext.Provider>
    )
    const tree = render(element)
    const backHomeBtn = tree.queryByTestId(testIdWithKey('BackToHome'))

    expect(tree).toMatchSnapshot()
    expect(backHomeBtn).toBeNull()
  })

  test.skip('Updates after delay', async () => {
    const element = (
      <NavigationContext.Provider value={navigationContext}>
        <ConnectionModal navigation={navigationContext} route={props as any} />
      </NavigationContext.Provider>
    )
    const tree = render(element)

    await waitFor(() => {
      timeTravel(10000)
    })

    expect(tree).toMatchSnapshot()
  })

  test.skip('Dismiss on demand', async () => {
    const element = (
      <NavigationContext.Provider value={navigationContext}>
        <ConnectionModal navigation={navigationContext} route={props as any} />
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
