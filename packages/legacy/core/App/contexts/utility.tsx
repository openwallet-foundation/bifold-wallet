import React, { createContext, useContext } from 'react'
import { BaseLogger } from '@credo-ts/core'

import { ConsoleLogger } from '../services/logger'

export interface UtilityContext {
  log: BaseLogger
}

export const Utility = createContext<UtilityContext>(null as unknown as UtilityContext)

export const UtilityProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const logger = new ConsoleLogger()

  return (
    <Utility.Provider
      value={{
        log: logger,
      }}
    >
      {children}
    </Utility.Provider>
  )
}

export const useUtility = () => {
  const utilityContext = useContext(Utility)
  if (!utilityContext) {
    throw new Error('utilityContext must be used within a CommonUtilProvider')
  }

  return utilityContext
}
