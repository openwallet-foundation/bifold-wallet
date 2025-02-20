import { render, waitFor } from '@testing-library/react-native'
import React from 'react'
import Toast from 'react-native-toast-message'
import { container } from 'tsyringe'

import mockNetworkContext from '../contexts/network'
import NetInfo from '../../App/components/network/NetInfo'
import toastConfig from '../../App/components/toast/ToastConfig'
import { CustomBasicAppContext } from '../helpers/app'
import { Container, TOKENS } from '../../App/container-api'
import { MainContainer } from '../../App/container-impl'

const createContainerContextForNetInfo = (disableMediatorCheck: boolean): Container => {
  const context = new MainContainer(container.createChildContainer()).init()
  const config = context.resolve(TOKENS.CONFIG)
  context.container.registerInstance(TOKENS.CONFIG, { ...config, disableMediatorCheck })
  return context
}

// Bifold's top offset for toasts
const topOffset = 15

describe('NetInfo Component', () => {
  describe('with mediator check enabled', () => {
    beforeEach(() => {
      jest.resetAllMocks()
    })

    const context = createContainerContextForNetInfo(false)

    it('should not show toast when network check has not finished', async () => {
      mockNetworkContext.silentAssertConnectedNetwork.mockReturnValue(null)
  
      const { queryByText } = render(
        <CustomBasicAppContext container={context}>
          <NetInfo />
          <Toast topOffset={topOffset} config={toastConfig} />
        </CustomBasicAppContext>
      )
  
      await waitFor(async () => {
        const toast = await queryByText('NetInfo.NoInternetConnectionTitle', { exact: false })
        expect(toast).toBeNull()
      })
    })

    test('should show toast when network unavailable', async () => {
      mockNetworkContext.silentAssertConnectedNetwork.mockReturnValue(false)
  
      const tree = render(
        <CustomBasicAppContext container={context}>
          <NetInfo />
          <Toast topOffset={topOffset} config={toastConfig} />
        </CustomBasicAppContext>
      )

      expect(tree).toMatchSnapshot()
  
      await waitFor(async () => {
        const toast = await tree.queryByText('NetInfo.NoInternetConnectionTitle', { exact: false })
        expect(toast).toBeTruthy()
      })
    })
  
    it('should show toast when network is connected but mediator is unreachable', async () => {
      mockNetworkContext.silentAssertConnectedNetwork.mockReturnValue(true)
      mockNetworkContext.assertMediatorReachable.mockResolvedValue(new Promise((resolve) => resolve(false)))
  
      const { queryByText } = render(
        <CustomBasicAppContext container={context}>
          <NetInfo />
          <Toast topOffset={topOffset} config={toastConfig} />
        </CustomBasicAppContext>
      )
  
      await waitFor(async () => {
        const toast = await queryByText('NetInfo.NoInternetConnectionTitle', { exact: false })
        expect(toast).toBeTruthy()
      })
    })
  
    it('should not show toast when network is connected and mediator is reachable', async () => {
      mockNetworkContext.silentAssertConnectedNetwork.mockReturnValue(true)
      mockNetworkContext.assertMediatorReachable.mockResolvedValue(new Promise((resolve) => resolve(true)))
  
      const { queryByText } = render(
        <CustomBasicAppContext container={context}>
          <NetInfo />
          <Toast topOffset={topOffset} config={toastConfig} />
        </CustomBasicAppContext>
      )
  
      await waitFor(async () => {
        const toast = await queryByText('NetInfo.NoInternetConnectionTitle', { exact: false })
        expect(toast).toBeNull()
      })
    })
  })

  describe('with mediator check disabled', () => {
    beforeEach(() => {
      jest.resetAllMocks()
    })

    const context = createContainerContextForNetInfo(true)

    it('should not show toast when internet is reachable', async () => {
      mockNetworkContext.assertInternetReachable.mockReturnValue(true)

      const { queryByText } = render(
        <CustomBasicAppContext container={context}>
          <NetInfo />
          <Toast topOffset={topOffset} config={toastConfig} />
        </CustomBasicAppContext>
      )
  
      await waitFor(async () => {
        const toast = await queryByText('NetInfo.NoInternetConnectionTitle', { exact: false })
        expect(toast).toBeNull()
      })
    })

    it('should show toast when internet is not reachable', async () => {
      mockNetworkContext.assertInternetReachable.mockReturnValue(false)

      const { queryByText } = render(
        <CustomBasicAppContext container={context}>
          <NetInfo />
          <Toast topOffset={topOffset} config={toastConfig} />
        </CustomBasicAppContext>
      )
  
      await waitFor(async () => {
        const toast = await queryByText('NetInfo.NoInternetConnectionTitle', { exact: false })
        expect(toast).toBeTruthy()
      })
    })

    it('should not show toast when internet reachability is unknown', async () => {
      mockNetworkContext.assertInternetReachable.mockReturnValue(null)

      const { queryByText } = render(
        <CustomBasicAppContext container={context}>
          <NetInfo />
          <Toast topOffset={topOffset} config={toastConfig} />
        </CustomBasicAppContext>
      )
  
      await waitFor(async () => {
        const toast = await queryByText('NetInfo.NoInternetConnectionTitle', { exact: false })
        expect(toast).toBeNull()
      })
    })
  })
})