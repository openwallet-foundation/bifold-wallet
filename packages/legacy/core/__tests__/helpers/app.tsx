import { PropsWithChildren, useMemo } from 'react'
import { ConfigurationContext } from '../../App/contexts/configuration'
import { NetworkContext } from '../../App/contexts/network'

import configurationContext from '../contexts/configuration'
import networkContext from '../contexts/network'
import { ContainerProvider } from '../../App/container-api'
import { MainContainer } from '../../App/container-impl'
import { container } from 'tsyringe'

export const BasicAppContext: React.FC<PropsWithChildren> = ({ children }) => {
      const context = useMemo(()=>new MainContainer(container.createChildContainer()).init(),[])
  return (
    <ContainerProvider value={context}>
      <ConfigurationContext.Provider value={configurationContext}>
        <NetworkContext.Provider value={networkContext}>{children}</NetworkContext.Provider>
      </ConfigurationContext.Provider>
    </ContainerProvider>
  )
}


