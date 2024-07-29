import { fireEvent, render, waitFor } from '@testing-library/react-native'
import React from 'react'

import { useConfiguration } from '../../App/contexts/configuration'
import { StoreProvider, defaultState } from '../../App/contexts/store'
import { testIdWithKey } from '../../App/utils/testable'
import PushNotification from '../../App/screens/PushNotification'

jest.mock('../../App/contexts/configuration', () => ({
  useConfiguration: jest.fn(),
}))

describe('displays a push notification screen', () => {
  const setup = jest.fn()
  const toggle = jest.fn()
  const status = async () => await Promise.resolve('denied')
  beforeEach(() => {
    // @ts-ignore-next-line
    useConfiguration.mockReturnValue({ enablePushNotifications: { setup, toggle, status } })
    jest.clearAllMocks()
  })

  test('Push notification screen renders correctly in settings', async () => {
    const route = {
      params: {
        isMenu: true,
      },
    } as any
    const tree = render(
      <StoreProvider
        initialState={{
          ...defaultState,
        }}
      >
        <PushNotification route={route} navigation={jest.fn() as any} />
      </StoreProvider>
    )

    expect(tree).toMatchSnapshot()
    const toggleSwitch = tree.getByTestId(testIdWithKey('PushNotificationSwitch'))
    expect(toggleSwitch).not.toBe(null)
    await waitFor(() => {
      fireEvent(toggleSwitch, 'onValueChange', true)
    })
    expect(setup).toHaveBeenCalledTimes(1)
    expect(toggle).toHaveBeenCalledTimes(1)
  })
  test('Push notification screen renders correctly in onboarding', async () => {
    const route = {
      params: {},
    } as any
    const tree = render(
      <StoreProvider
        initialState={{
          ...defaultState,
        }}
      >
        <PushNotification route={route} navigation={jest.fn() as any} />
      </StoreProvider>
    )

    const continueButton = tree.getByTestId(testIdWithKey('PushNotificationContinue'))
    expect(continueButton).not.toBe(null)
    await waitFor(() => {
      fireEvent(continueButton, 'press')
    })
    expect(setup).toHaveBeenCalledTimes(1)
  })
})
