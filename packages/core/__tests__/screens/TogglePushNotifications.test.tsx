import { fireEvent, render, waitFor } from '@testing-library/react-native'
import React from 'react'

import { container } from 'tsyringe'
import { TOKENS } from '../../src/container-api'
import { MainContainer } from '../../src/container-impl'
import { StoreProvider, defaultState } from '../../src/contexts/store'
import TogglePushNotifications from '../../src/screens/TogglePushNotifications'
import { Config } from '../../src/types/config'
import { testIdWithKey } from '../../src/utils/testable'
import { CustomBasicAppContext } from '../helpers/app'

describe('TogglePushNotification Screen', () => {
  const setup = jest.fn()
  const toggle = jest.fn()
  const status = async () => await Promise.resolve('denied')
  const context = new MainContainer(container.createChildContainer()).init()
  const config: Config = context.container.resolve(TOKENS.CONFIG)
  context.container.registerInstance(TOKENS.CONFIG, { ...config, enablePushNotifications: { status, setup, toggle } })

  test('Push notification screen renders correctly in settings', async () => {
    const tree = render(
      <StoreProvider
        initialState={{
          ...defaultState,
        }}
      >
        <CustomBasicAppContext container={context}>
          <TogglePushNotifications />
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
})
