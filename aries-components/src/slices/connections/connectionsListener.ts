import { EnhancedStore } from "@reduxjs/toolkit"
import { ConnectionStateChangedEvent } from "aries-framework"
import { Agent, ConnectionEventTypes } from "aries-framework"
import { connectionsSlice } from './connectionsSlice'

const startConnectionListener = (agent: Agent, store: EnhancedStore) => {
    const listener = ((event: ConnectionStateChangedEvent) => {
        const record = event.payload.connectionRecord
        store.dispatch(connectionsSlice.actions.updateOrAdd(record))
    })

    agent.events.on(ConnectionEventTypes.ConnectionStateChanged, listener)

    return () => {
        agent.events.off(ConnectionEventTypes.ConnectionStateChanged, listener)
    }
}

export { startConnectionListener }
