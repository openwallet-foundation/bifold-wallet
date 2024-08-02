import { NetInfoStateType, useNetInfo } from '@react-native-community/netinfo'
import * as React from 'react'
import { createContext, useContext, useState } from 'react'

import NetInfoModal from '../components/modals/NetInfoModal'
import { canConnectToLedgerNode } from '../utils/ledger'

export type LedgerNodeList = Array<{ host: string; port: number }>
export interface NetworkContext {
  silentAssertConnectedNetwork: () => boolean
  assertConnectedNetwork: () => boolean
  displayNetInfoModal: () => void
  hideNetInfoModal: () => void
  assertLedgerConnectivity: () => Promise<boolean | undefined>
  setLedgerNodes: (nodes: LedgerNodeList) => void
}

export const NetworkContext = createContext<NetworkContext>(null as unknown as NetworkContext)

export const NetworkProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const netInfo = useNetInfo()
  const [isNetInfoModalDisplayed, setIsNetInfoModalDisplayed] = useState<boolean>(false)
  let currentNodes: LedgerNodeList | undefined = undefined

  const setLedgerNodes = (nodes: LedgerNodeList) => {
    currentNodes = nodes
  }

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

  const assertLedgerConnectivity = async (): Promise<boolean | undefined> => {
    if (typeof currentNodes === 'undefined') {
      return undefined
    }

    if (currentNodes.length === 0) {
      return false
    }

    const connections = await Promise.all(
      currentNodes.map((n: { host: string; port: number }) => canConnectToLedgerNode(n))
    )

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
        setLedgerNodes,
      }}
    >
      {children}
      <NetInfoModal visible={isNetInfoModalDisplayed} onSubmit={() => hideNetInfoModal()} />
    </NetworkContext.Provider>
  )
}

export const useNetwork = () => useContext(NetworkContext)
