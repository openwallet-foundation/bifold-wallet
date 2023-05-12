/* eslint-disable @typescript-eslint/no-explicit-any */
import { NavigationContext } from '@react-navigation/native'
import { render, waitFor, fireEvent } from '@testing-library/react-native'
import React from 'react'

import { ConfigurationContext } from '../../App/contexts/configuration'
import configurationContext from '../contexts/configuration'
import ConnectionModal from '../../App/screens/Connection'
import { testIdWithKey } from '../../App/utils/testable'
import navigationContext from '../contexts/navigation'
import timeTravel from '../helpers/timetravel'

jest.useFakeTimers('legacy')
jest.spyOn(global, 'setTimeout')

const props = { params: { connectionId: '123' } }

describe('ConnectionModal Component', () => {
  test('Renders correctly', async () => {
    const element = (
      <ConfigurationContext.Provider value={configurationContext}>
        <NavigationContext.Provider value={navigationContext}>
          <ConnectionModal navigation={navigationContext} route={props as any} />
        </NavigationContext.Provider>
      </ConfigurationContext.Provider>
    )
    const tree = render(element)

    expect(tree).toMatchSnapshot()
  })

  test('Updates after delay', async () => {
    const element = (
      <ConfigurationContext.Provider value={configurationContext}>
        <NavigationContext.Provider value={navigationContext}>
          <ConnectionModal navigation={navigationContext} route={props as any} />
        </NavigationContext.Provider>
      </ConfigurationContext.Provider>
    )
    const tree = render(element)

    await waitFor(() => {
      timeTravel(10000)
    })

    expect(tree).toMatchSnapshot()
  })

  test('Dismiss on demand', async () => {
    const element = (
      <ConfigurationContext.Provider value={configurationContext}>
        <NavigationContext.Provider value={navigationContext}>
          <ConnectionModal navigation={navigationContext} route={props as any} />
        </NavigationContext.Provider>
      </ConfigurationContext.Provider>
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
