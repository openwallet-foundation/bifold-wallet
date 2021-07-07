import { EnhancedStore } from '@reduxjs/toolkit'
import { ConnectionStateChangedEvent } from 'aries-framework'
import { Agent, ConnectionEventTypes } from 'aries-framework'
import { connectionsSlice } from './connectionsSlice'

/**
 * Starts an EventListener that listens for ConnectionRecord state changes
 * and updates the store accordingly.
 *
 * This function **must** be called if you're working with ConnectionRecords.
 * If you don't, the store won't be updated.
 */
const startConnectionsListener = (agent: Agent, store: EnhancedStore) => {
  const listener = (event: ConnectionStateChangedEvent) => {
    const record = event.payload.connectionRecord
    store.dispatch(connectionsSlice.actions.updateOrAdd(record))
  }

  agent.events.on(ConnectionEventTypes.ConnectionStateChanged, listener)

  return () => {
    agent.events.off(ConnectionEventTypes.ConnectionStateChanged, listener)
  }
}

export { startConnectionsListener }
