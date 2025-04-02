import { fireEvent, render, waitFor } from '@testing-library/react-native'
import React from 'react'

import { StoreProvider, defaultState } from '../../src/contexts/store'
import { testIdWithKey } from '../../src/utils/testable'
import PushNotification from '../../src/screens/PushNotification'
import { CustomBasicAppContext } from '../helpers/app'
import { MainContainer } from '../../src/container-impl'
import { container } from 'tsyringe'
import { TOKENS } from '../../src/container-api'
import { Config } from '../../src/types/config'

describe('PushNotification Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  const setup = jest.fn()
  const toggle = jest.fn()
  const status = async () => await Promise.resolve('denied')
  const context = new MainContainer(container.createChildContainer()).init()
  const config: Config = context.container.resolve(TOKENS.CONFIG)
  context.container.registerInstance(TOKENS.CONFIG, { ...config, enablePushNotifications: { status, setup, toggle } })

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
        <CustomBasicAppContext container={context}>
          <PushNotification route={route} navigation={jest.fn() as any} />
        </CustomBasicAppContext>
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
        <CustomBasicAppContext container={context}>
          <PushNotification route={route} navigation={jest.fn() as any} />
        </CustomBasicAppContext>
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
