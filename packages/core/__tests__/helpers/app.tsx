import React, { PropsWithChildren, useMemo } from 'react'
import { NetworkContext } from '../../src/contexts/network'

import networkContext from '../contexts/network'
import { Container, ContainerProvider, TOKENS } from '../../src/container-api'
import { MainContainer } from '../../src/container-impl'
import { container } from 'tsyringe'
import { OpenIDCredentialRecordProvider } from '../../src/modules/openid/context/OpenIDCredentialRecordProvider'
import { MockLogger } from './logger'

export const BasicAppContext: React.FC<PropsWithChildren> = ({ children }) => {
  const context = useMemo(() => {
    const c = new MainContainer(container.createChildContainer()).init()
    c.resolve(TOKENS.UTIL_LOGGER)
    c.container.registerInstance(TOKENS.UTIL_LOGGER, new MockLogger())
    return c
  }, [])

  return (
    <ContainerProvider value={context}>
      <OpenIDCredentialRecordProvider>
        <NetworkContext.Provider value={networkContext}>{children}</NetworkContext.Provider>
      </OpenIDCredentialRecordProvider>
    </ContainerProvider>
  )
}

interface CustomBasicAppContextProps extends PropsWithChildren {
  container: Container
}
export const CustomBasicAppContext: React.FC<CustomBasicAppContextProps> = ({ children, container }) => {
  const context = container
  return (
    <ContainerProvider value={context}>
      <NetworkContext.Provider value={networkContext}>{children}</NetworkContext.Provider>
    </ContainerProvider>
  )
}
