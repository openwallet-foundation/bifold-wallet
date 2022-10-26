import React, { createContext, useContext, useState } from 'react'

import { AppConsoleLogger, LogLevel } from '../services/logger'

export interface AppCommonsContext {
  log: (message: string, logLevel: Exclude<LogLevel, LogLevel.off>) => void
}

export const AppCommons = createContext<AppCommonsContext>(null as unknown as AppCommonsContext)

export const AppCommonsProvider: React.FC = ({ children }) => {
  const logger = new AppConsoleLogger(LogLevel.test)
  const log = async (messaage: string, logLevel: Exclude<LogLevel, LogLevel.off>) => {
    logger.log(logLevel, messaage)
    //TODO: do some more logic like collecting errors for later logging and investigation
  }

  return (
    <AppCommons.Provider
      value={{
        log: log,
      }}
    >
      {children}
    </AppCommons.Provider>
  )
}

export const useCommons = () => {
  const commonsContext = useContext(AppCommons)
  if (!commonsContext) {
    throw new Error('commonsContext must be used within a AppCommonsProvider')
  }
  return commonsContext
}

export const appLog = (messaage: string, logLevel: Exclude<LogLevel, LogLevel.off>) => {
  const { log } = useCommons()
  log(messaage, logLevel)
}
