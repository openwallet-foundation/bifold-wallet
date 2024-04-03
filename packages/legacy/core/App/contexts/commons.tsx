import { ConnectionRecord, CredentialExchangeRecord } from '@aries-framework/core'
import { useAgent } from '@aries-framework/react-hooks'
import React, { createContext, useContext } from 'react'

import { AppConsoleLogger, LogLevel } from '../services/logger'

export interface AppCommonsContext {
  log: (message: string, logLevel: Exclude<LogLevel, LogLevel.off>) => void
  getCredentialById(credentialRecordId: string): Promise<CredentialExchangeRecord>
  getConnectionById(connectionId: string): Promise<ConnectionRecord>
}

export const AppCommons = createContext<AppCommonsContext>(null as unknown as AppCommonsContext)

export const CommonUtilProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const logger = new AppConsoleLogger(LogLevel.test)
  const { agent } = useAgent()

  /** HOOKS */
  const log = async (messaage: string, logLevel: Exclude<LogLevel, LogLevel.off>) => {
    logger.log(logLevel, messaage)
    //TODO: do some more logic like collecting errors for later logging and investigation
  }

  /**
   * Retrieve a credential record by id
   *
   * @param credentialRecordId The credential record id
   * @return The credential record
   */
  async function getCredentialById(credentialRecordId: string): Promise<CredentialExchangeRecord> {
    try {
      if (!agent) {
        log(`[AppCommons]: Get credential by id: Agent not set`, LogLevel.error)
        throw new Error(`Agent not set`)
      }
      return await agent.credentials.getById(credentialRecordId)
    } catch (e: unknown) {
      log(`[AppCommons]: Get credential by id: ${e}`, LogLevel.error)
      throw new Error(`${e}`)
    }
  }

  /**
   * Retrieve a connection record by id
   *
   * @param connectionId The connection record id
   * @return The connection record
   */
  async function getConnectionById(connectionId: string): Promise<ConnectionRecord> {
    try {
      if (!agent) {
        log(`[AppCommons]: Get credential by id: Agent not set`, LogLevel.error)
        throw new Error(`Agent not set`)
      }
      return await agent.connections.getById(connectionId)
    } catch (e: unknown) {
      log(`[AppCommons]: Get getConnectionById by id: ${e}`, LogLevel.error)
      throw new Error(`${e}`)
    }
  }

  return (
    <AppCommons.Provider
      value={{
        log: log,
        getCredentialById: getCredentialById,
        getConnectionById: getConnectionById,
      }}
    >
      {children}
    </AppCommons.Provider>
  )
}

export const useCommons = () => {
  const commonsContext = useContext(AppCommons)
  if (!commonsContext) {
    throw new Error('commonsContext must be used within a CommonUtilProvider')
  }
  return commonsContext
}
