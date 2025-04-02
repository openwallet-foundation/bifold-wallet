import { NetInfoStateType, useNetInfo } from '@react-native-community/netinfo'
import { createContext, useContext, useState, useCallback, PropsWithChildren } from 'react'

import NetInfoModal from '../components/modals/NetInfoModal'

export interface NetworkContext {
  silentAssertConnectedNetwork: () => boolean | null
  assertNetworkConnected: () => boolean
  displayNetInfoModal: () => void
  hideNetInfoModal: () => void
  assertInternetReachable: () => boolean | null
}

export const NetworkContext = createContext<NetworkContext>(null as unknown as NetworkContext)

// NOTE: @react-native-community/netinfo can be configured to use whichever reachability check desired
// eg. isInternetReachable can be set to check a specific URL (like your mediator). See the docs here for more info:
// https://github.com/react-native-netinfo/react-native-netinfo?tab=readme-ov-file#configure
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
    return type === NetInfoStateType.unknown
      ? null
      : isConnected || [NetInfoStateType.wifi, NetInfoStateType.cellular].includes(type)
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

  return (
    <NetworkContext.Provider
      value={{
        silentAssertConnectedNetwork,
        assertNetworkConnected,
        displayNetInfoModal,
        hideNetInfoModal,
        assertInternetReachable,
      }}
    >
      {children}
      <NetInfoModal visible={isNetInfoModalDisplayed} onSubmit={() => hideNetInfoModal()} />
    </NetworkContext.Provider>
  )
}

export const useNetwork = () => useContext(NetworkContext)
