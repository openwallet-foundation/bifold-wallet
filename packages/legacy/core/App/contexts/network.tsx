import { NetInfoStateType, useNetInfo } from '@react-native-community/netinfo'
import { createContext, useContext, useState, useCallback, PropsWithChildren } from 'react'

import NetInfoModal from '../components/modals/NetInfoModal'
import { hostnameFromURL, canConnectToHost } from '../utils/network'
import { Config } from 'react-native-config'

export interface NetworkContext {
  silentAssertConnectedNetwork: () => boolean | null
  assertNetworkConnected: () => boolean
  displayNetInfoModal: () => void
  hideNetInfoModal: () => void
  assertInternetReachable: () => boolean | null
  assertMediatorReachable: () => Promise<boolean>
}

export const NetworkContext = createContext<NetworkContext>(null as unknown as NetworkContext)

export const NetworkProvider = ({ children }: PropsWithChildren) => {
  const { isConnected, type, isInternetReachable } = useNetInfo()
  const [isNetInfoModalDisplayed, setIsNetInfoModalDisplayed] = useState<boolean>(false)

  const displayNetInfoModal = useCallback(() => {
    setIsNetInfoModalDisplayed(true)
  }, [])

  const hideNetInfoModal = useCallback(() => {
    setIsNetInfoModalDisplayed(false)
  }, [])

  /**
   * Returns null until the network state is known, then returns boolean
   * Useful for cases where we do not want to take action until the network state is known
   *
   * @returns {boolean | null} - `true` if the network is connected, `false` if not connected,
   *                             and `null` if the network status not yet known
   */
  const silentAssertConnectedNetwork = useCallback((): boolean | null => {
    return type === NetInfoStateType.unknown ? null : isConnected || [NetInfoStateType.wifi, NetInfoStateType.cellular].includes(type)
  }, [isConnected, type])


  /**
   * Strictly asserts that the network is connected. Will return false even if
   * the network state is not yet known - in this case it will also display the
   * NetInfoModal
   * Useful for cases where we must be sure of connectivity before proceeding
   *
   * @returns {boolean} - `true` if the network is checked and connected, otherwise `false`
   */
  const assertNetworkConnected = useCallback(() => {
    const connectionConfirmed = silentAssertConnectedNetwork() === true
    if (!connectionConfirmed) {
      displayNetInfoModal()
    }

    return connectionConfirmed
  }, [silentAssertConnectedNetwork, displayNetInfoModal])

  const assertInternetReachable = useCallback((): boolean | null => {
     return isInternetReachable
  }, [isInternetReachable])

  const assertMediatorReachable = useCallback(async (): Promise<boolean> => {
    const hostname = hostnameFromURL(Config.MEDIATOR_URL!)

    if (hostname === null || hostname.length === 0) {
      return false
    }

    const nodes = [{ host: hostname, port: 443 }]
    const connections = await Promise.all(nodes.map((n: { host: string; port: number }) => canConnectToHost(n)))

    return connections.includes(true)
  }, [])

  return (
    <NetworkContext.Provider
      value={{
        silentAssertConnectedNetwork,
        assertNetworkConnected,
        displayNetInfoModal,
        hideNetInfoModal,
        assertInternetReachable,
        assertMediatorReachable
      }}
    >
      {children}
      <NetInfoModal visible={isNetInfoModalDisplayed} onSubmit={() => hideNetInfoModal()} />
    </NetworkContext.Provider>
  )
}

export const useNetwork = () => useContext(NetworkContext)
