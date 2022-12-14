import { NetInfoStateType, useNetInfo } from '@react-native-community/netinfo'
import * as React from 'react'
import { createContext, useContext, useState } from 'react'

import NetInfoModal from '../components/modals/NetInfoModal'
import { fetchLedgerNodes, canConnectToLedgerNode } from '../utils/ledger'

export interface NetworkContext {
  silentAssertConnectedNetwork: () => boolean
  assertConnectedNetwork: () => boolean
  displayNetInfoModal: () => void
  hideNetInfoModal: () => void
  assertLedgerConnectivity: () => Promise<boolean>
}

export const NetworkContext = createContext<NetworkContext>(null as unknown as NetworkContext)

export const NetworkProvider: React.FC = ({ children }) => {
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

  const assertConnectedNetwork = () => {
    const isConnected = silentAssertConnectedNetwork()
    if (!isConnected) {
      displayNetInfoModal()
    }

    return isConnected
  }

  const assertLedgerConnectivity = async (): Promise<boolean> => {
    const nodes = fetchLedgerNodes()

    if (typeof nodes === 'undefined' || nodes.length === 0) {
      return false
    }

    const connections = await Promise.all(nodes.map((n: { host: string; port: number }) => canConnectToLedgerNode(n)))
    return connections.includes(true)
  }

  return (
    <NetworkContext.Provider
      value={{
        silentAssertConnectedNetwork,
        assertConnectedNetwork,
        displayNetInfoModal,
        hideNetInfoModal,
        assertLedgerConnectivity,
      }}
    >
      {children}
      <NetInfoModal visible={isNetInfoModalDisplayed} onSubmit={() => hideNetInfoModal()} />
    </NetworkContext.Provider>
  )
}

export const useNetwork = () => useContext(NetworkContext)
