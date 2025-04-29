import { fireEvent, render, waitFor } from '@testing-library/react-native'
import React from 'react'

import { container } from 'tsyringe'
import { TOKENS } from '../../src/container-api'
import { MainContainer } from '../../src/container-impl'
import { StoreProvider, defaultState } from '../../src/contexts/store'
import PushNotifications from '../../src/screens/PushNotifications'
import { Config } from '../../src/types/config'
import { testIdWithKey } from '../../src/utils/testable'
import { CustomBasicAppContext } from '../helpers/app'

describe('PushNotifications Screen', () => {
  const setup = jest.fn()
  const toggle = jest.fn()
  const status = async () => await Promise.resolve('denied')
  const context = new MainContainer(container.createChildContainer()).init()
  const config: Config = context.container.resolve(TOKENS.CONFIG)
  context.container.registerInstance(TOKENS.CONFIG, { ...config, enablePushNotifications: { status, setup, toggle } })

  test('Push notification screen renders correctly in onboarding', async () => {
    const tree = render(
      <StoreProvider
        initialState={{
          ...defaultState,
        }}
      >
        <CustomBasicAppContext container={context}>
          <PushNotifications />
        </CustomBasicAppContext>
      </StoreProvider>
    )

    expect(tree).toMatchSnapshot()
    const continueButton = tree.getByTestId(testIdWithKey('PushNotificationContinue'))
    expect(continueButton).not.toBe(null)
    await waitFor(() => {
      fireEvent(continueButton, 'press')
    })
    expect(setup).toHaveBeenCalledTimes(1)
  })
})
