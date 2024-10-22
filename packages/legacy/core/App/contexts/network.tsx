import { NetInfoStateType, useNetInfo } from '@react-native-community/netinfo'
import * as React from 'react'
import { createContext, useContext, useState } from 'react'

import NetInfoModal from '../components/modals/NetInfoModal'
import { hostnameFromURL, canConnectToHost } from '../utils/network'
import { Config } from 'react-native-config'
export interface NetworkContext {
  silentAssertConnectedNetwork: () => boolean
  assertNetworkConnected: () => boolean
  displayNetInfoModal: () => void
  hideNetInfoModal: () => void
  assertNetworkReachable: () => Promise<boolean>
}

export const NetworkContext = createContext<NetworkContext>(null as unknown as NetworkContext)

export const NetworkProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const netInfo = useNetInfo()
  const [isNetInfoModalDisplayed, setIsNetInfoModalDisplayed] = useState<boolean>(false)

  const displayNetInfoModal = () => {
    setIsNetInfoModalDisplayed(true)
  }

  const hideNetInfoModal = () => {
    setIsNetInfoModalDisplayed(false)
  }

  const silentAssertConnectedNetwork = () => {
    return netInfo.isConnected || netInfo.type !== NetInfoStateType.none
  }

  const assertNetworkConnected = () => {
    const isConnected = silentAssertConnectedNetwork()
    if (!isConnected) {
      displayNetInfoModal()
    }

    return isConnected
  }

  const assertNetworkReachable = async (): Promise<boolean> => {
    const hostname = hostnameFromURL(Config.MEDIATOR_URL!)

    if (hostname === null || hostname.length === 0) {
      return false
    }

    const nodes = [{ host: hostname, port: 443 }]
    const connections = await Promise.all(nodes.map((n: { host: string; port: number }) => canConnectToHost(n)))

    return connections.includes(true)
  }

  return (
    <NetworkContext.Provider
      value={{
        silentAssertConnectedNetwork,
        assertNetworkConnected,
        displayNetInfoModal,
        hideNetInfoModal,
        assertNetworkReachable,
      }}
    >
      {children}
      <NetInfoModal visible={isNetInfoModalDisplayed} onSubmit={() => hideNetInfoModal()} />
    </NetworkContext.Provider>
  )
}

export const useNetwork = () => useContext(NetworkContext)
