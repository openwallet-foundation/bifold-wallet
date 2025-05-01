import { render, waitFor } from '@testing-library/react-native'
import React from 'react'
import Toast from 'react-native-toast-message'

import mockNetworkContext from '../contexts/network'
import NetInfo from '../../src/components/network/NetInfo'
import toastConfig from '../../src/components/toast/ToastConfig'
import { BasicAppContext } from '../helpers/app'

// Bifold's top offset for toasts
const topOffset = 15

// For toast animations
jest.useFakeTimers()

describe('NetInfo Component', () => {
  beforeEach(() => {
    jest.clearAllTimers()
    jest.clearAllMocks()
  })

  it('should not show toast when internet is reachable', async () => {
    mockNetworkContext.assertInternetReachable.mockReturnValue(true)

    const { queryByText } = render(
      <BasicAppContext>
        <NetInfo />
        <Toast topOffset={topOffset} config={toastConfig} />
      </BasicAppContext>
    )

    await waitFor(async () => {
      const toast = await queryByText('NetInfo.NoInternetConnectionTitle', { exact: false })
      expect(toast).toBeNull()
    })
  })

  it('should show toast when internet is not reachable', async () => {
    mockNetworkContext.assertInternetReachable.mockReturnValue(false)

    const { queryByText } = render(
      <BasicAppContext>
        <NetInfo />
        <Toast topOffset={topOffset} config={toastConfig} />
      </BasicAppContext>
    )

    await waitFor(async () => {
      const toast = await queryByText('NetInfo.NoInternetConnectionTitle', { exact: false })
      expect(toast).toBeTruthy()
    })
  })

  it('should not show toast when internet reachability is unknown', async () => {
    mockNetworkContext.assertInternetReachable.mockReturnValue(null)

    const { queryByText } = render(
      <BasicAppContext>
        <NetInfo />
        <Toast topOffset={topOffset} config={toastConfig} />
      </BasicAppContext>
    )

    await waitFor(async () => {
      const toast = await queryByText('NetInfo.NoInternetConnectionTitle', { exact: false })
      expect(toast).toBeNull()
    })
  })
})
