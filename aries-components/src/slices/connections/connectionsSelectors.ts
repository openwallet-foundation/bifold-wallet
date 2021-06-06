import { useAppSelector } from '../../store'
import { ConnectionsState } from './connectionsSlice'

interface PartialConnectionState {
    connections: ConnectionsState
}

namespace ConnectionSelectors {

    export const allConnectionsSelector = (state: PartialConnectionState) => state.connections.connections.records

    export const connectionRecordByIdSelector = (connectionRecordId: string) => useAppSelector(state => state.connections.connections.records.find(x => x.id === connectionRecordId))

    export const connectionRecordByVerkeySelector = (verkey: string) => useAppSelector(state => state.connections.connections.records.find(x => x.verkey === verkey))

    export const connectionRecordByTheirKeySelector = (theirKey: string) => useAppSelector(state => state.connections.connections.records.find(x => x.theirKey === theirKey))

    export const invitationSelector = () => useAppSelector(state => state.connections.invitation.message)

    export const invitationByConnectionRecordIdSelector = (connectionRecordId: string) => 
        useAppSelector(state => {
            const record = state.connections.connections.records.find(x => x.id == connectionRecordId)

            if (!record) { return null }
            return record.invitation
        })
}


export {
    ConnectionSelectors
}
