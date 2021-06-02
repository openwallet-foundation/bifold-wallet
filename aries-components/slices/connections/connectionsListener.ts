import { EnhancedStore } from "@reduxjs/toolkit"
import { ConnectionStateChangedEvent } from "aries-framework"
import { Agent, ConnectionEventTypes } from "aries-framework"
import { connectionsSlice } from './connectionsSlice'

const startConnectionListener = (agent: Agent, store: EnhancedStore) => {
    agent.events.on(ConnectionEventTypes.ConnectionStateChanged, ((event: ConnectionStateChangedEvent) => {
        const prevState = event.payload.previousState
        const record = event.payload.connectionRecord
        store.dispatch(connectionsSlice.actions.updateOrAdd(record))
    }))
}

export { startConnectionListener }
