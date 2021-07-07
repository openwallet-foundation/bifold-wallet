/* eslint-disable @typescript-eslint/no-namespace */
import { ConnectionInvitationMessage, ConnectionsModule } from 'aries-framework'
import { createAsyncAgentThunk, ClassMethodParameters } from '../../utils'

namespace ConnectionThunks {
  /**
   * Retrieve all connections records
   */
  export const getAllConnections = createAsyncAgentThunk('connections/getAll', async (_, thunkApi) => {
    return thunkApi.extra.agent.connections.getAll()
  })

  /**
   * Creates a new ConnectionRecord and InvitationMessage.
   * These are both added to the state.
   */
  export const createConnection = createAsyncAgentThunk(
    'connections/createConnection',
    async (config: ClassMethodParameters<typeof ConnectionsModule, 'createConnection'>[0], thunkApi) => {
      return thunkApi.extra.agent.connections.createConnection(config)
    }
  )

  /**
   * Receive connection invitation as invitee and create connection. If auto accepting is enabled
   * via either the config passed in the function or the global agent config, a connection
   * request message will be send.
   */
  export const receiveInvitation = createAsyncAgentThunk(
    'connections/receiveInvitation',
    async (
      {
        invitation,
        config,
      }: {
        invitation: ConnectionInvitationMessage
        config?: ClassMethodParameters<typeof ConnectionsModule, 'receiveInvitation'>[1]
      },
      thunkApi
    ) => {
      return thunkApi.extra.agent.connections.receiveInvitation(invitation, config)
    }
  )

  /**
   * Receive connection invitation as invitee encoded as url and create connection. If auto accepting is enabled
   * via either the config passed in the function or the global agent config, a connection
   * request message will be send.
   */
  export const receiveInvitationFromUrl = createAsyncAgentThunk(
    'connections/receiveInvitationFromUrl',
    async (
      {
        invitationUrl,
        config,
      }: {
        invitationUrl: string
        config?: ClassMethodParameters<typeof ConnectionsModule, 'receiveInvitationFromUrl'>[1]
      },
      thunkApi
    ) => {
      return thunkApi.extra.agent.connections.receiveInvitationFromUrl(invitationUrl, config)
    }
  )

  /**
   * Accept a connection invitation as invitee (by sending a connection request message) for the connection with the specified connection id.
   * This is not needed when auto accepting of connections is enabled.
   */
  export const acceptInvitation = createAsyncAgentThunk(
    'connections/acceptInvitation',
    async (connectionId: string, thunkApi) => {
      return thunkApi.extra.agent.connections.acceptInvitation(connectionId)
    }
  )

  /**
   * Accept a connection request as inviter (by sending a connection response message) for the connection with the specified connection id.
   * This is not needed when auto accepting of connection is enabled.
   */
  export const acceptRequest = createAsyncAgentThunk(
    'connections/acceptRequest',
    async (connectionId: ClassMethodParameters<typeof ConnectionsModule, 'acceptRequest'>[0], thunkApi) => {
      return thunkApi.extra.agent.connections.acceptRequest(connectionId)
    }
  )

  /**
   * Accept a connection response as invitee (by sending a trust ping message) for the connection with the specified connection id.
   * This is not needed when auto accepting of connection is enabled.
   */
  export const acceptResponse = createAsyncAgentThunk(
    'connections/acceptResponse',
    async (connectionId: ClassMethodParameters<typeof ConnectionsModule, 'acceptRequest'>[0], thunkApi) => {
      return thunkApi.extra.agent.connections.acceptResponse(connectionId)
    }
  )
}

export { ConnectionThunks }
