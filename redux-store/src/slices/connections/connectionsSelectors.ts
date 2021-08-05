import { ConnectionState } from 'aries-framework'
import { ConnectionsState } from './connectionsSlice'

interface PartialConnectionState {
  connections: ConnectionsState
}

/**
 * Namespace that holds all ConnectionRecord related selectors.
 */
namespace ConnectionsSelectors {
  /**
   * Selector that retrieves the entire **connections** store object.
   */
  export const connectionsStateSelector = (state: PartialConnectionState) => state.connections.connections

  /**
   * Selector that retrieves all ConnectionRecords from the store.
   */
  export const connectionRecordsSelector = (state: PartialConnectionState) => state.connections.connections.records

  /**
   * Selector that retrieves all ConnectionRecords from the store with specified {@link ConnectionState}.
   */
  export const connectionRecordsByStateSelector =
    (connectionState: ConnectionState) => (state: PartialConnectionState) =>
      state.connections.connections.records.filter((record) => record.state === connectionState)

  /**
   * Selector that retrieves the entire **invitation** store object.
   */
  export const invitationStateSelector = (state: PartialConnectionState) => state.connections.invitation

  /**
   * Selector that fetches a ConnectionRecord by id from the state.
   */
  export const connectionRecordByIdSelector = (connectionRecordId: string) => (state: PartialConnectionState) =>
    state.connections.connections.records.find((x) => x.id === connectionRecordId)

  /**
   * Selector that fetches a ConnectionRecord by its verification key from the state.
   */
  export const connectionRecordByVerkeySelector = (verkey: string) => (state: PartialConnectionState) =>
    state.connections.connections.records.find((x) => x.verkey === verkey)

  /**
   * Selector that fetches a ConnectionRecord by their key from the state.
   */
  export const connectionRecordByTheirKeySelector = (theirKey: string) => (state: PartialConnectionState) =>
    state.connections.connections.records.find((x) => x.theirKey === theirKey)

  /**
   * Selector that fetches the InvitationMessage based on a ConnectionRecord id.
   */
  export const invitationByConnectionRecordIdSelector =
    (connectionRecordId: string) => (state: PartialConnectionState) => {
      const record = state.connections.connections.records.find((x) => x.id == connectionRecordId)

      if (!record) {
        return null
      }
      return record.invitation
    }
}

export { ConnectionsSelectors }
