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
   * Selector that all ConnectionRecords from the state.
   */
  export const connectionRecordsSelector = (state: PartialConnectionState) => state.connections.connections.records

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

  /**
   * Namespace that holds selectors that fetch ConnectionRecords from the store
   * based on their current state.
   */
  export namespace ConnectionRecordStateSelectors {
    /**
     * Selector to retrieve all ConnectionRecords from the store that have the
     * **init** state.
     */
    export const initSelector = (state: PartialConnectionState) =>
      state.connections.connections.records.filter((x) => x.state === ConnectionState.Init)

    /**
     * Selector to retrieve all ConnectionRecords from the store that have the
     * **invited** state.
     */
    export const invitedSelector = (state: PartialConnectionState) =>
      state.connections.connections.records.filter((x) => x.state === ConnectionState.Invited)

    /**
     * Selector to retrieve all ConnectionRecords from the store that have the
     * **requested** state.
     */
    export const requestedSelector = (state: PartialConnectionState) =>
      state.connections.connections.records.filter((x) => x.state === ConnectionState.Requested)

    /**
     * Selector to retrieve all ConnectionRecords from the store that have the
     * **responded** state.
     */
    export const respondedSelector = (state: PartialConnectionState) =>
      state.connections.connections.records.filter((x) => x.state === ConnectionState.Responded)

    /**
     * Selector to retrieve all ConnectionRecords from the store that have the
     * **complete** state.
     */
    export const completeSelector = (state: PartialConnectionState) =>
      state.connections.connections.records.filter((x) => x.state === ConnectionState.Complete)
  }
}

export { ConnectionsSelectors }
