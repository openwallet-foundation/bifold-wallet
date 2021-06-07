/* eslint-disable @typescript-eslint/no-namespace */
import { ConnectionInvitationMessage } from 'aries-framework'
import { ConnectionsModule } from 'aries-framework/build/src/modules/connections/ConnectionsModule'

import { createAsyncAgentThunk, ClassMethodParameters } from '../../utils'

namespace ConnectionThunks {
  export const fetchAllConnections = createAsyncAgentThunk('connections/fetchAll', async (_, thunkApi) => {
    return thunkApi.extra.agent.connections.getAll()
  })

  export const createConnection = createAsyncAgentThunk(
    'connections/createConnection',
    async (options: ClassMethodParameters<typeof ConnectionsModule, 'createConnection'>[0], thunkApi) => {
      return thunkApi.extra.agent.connections.createConnection(options)
    }
  )

  export const receiveInvitation = createAsyncAgentThunk(
    'connections/receiveInvitation',
    async (
      {
        invitation,
        options,
      }: {
        invitation: ConnectionInvitationMessage
        options?: ClassMethodParameters<typeof ConnectionsModule, 'receiveInvitation'>[1]
      },
      thunkApi
    ) => {
      await thunkApi.extra.agent.connections.receiveInvitation(invitation, options)
    }
  )

  export const receiveInvitationFromUrl = createAsyncAgentThunk(
    'connections/receiveInvitationFromUrl',
    async (
      {
        invitationUrl,
        options,
      }: {
        invitationUrl: string
        options?: ClassMethodParameters<typeof ConnectionsModule, 'receiveInvitationFromUrl'>[1]
      },
      thunkApi
    ) => {
      await thunkApi.extra.agent.connections.receiveInvitationFromUrl(invitationUrl, options)
    }
  )

  export const acceptInvitation = createAsyncAgentThunk(
    'connections/acceptInvitation',
    async (
      options: {
        connectionId: string
      },
      thunkApi
    ) => {
      await thunkApi.extra.agent.connections.acceptInvitation(options.connectionId)
    }
  )

  export const acceptRequest = createAsyncAgentThunk(
    'connections/acceptRequest',
    async (connectionId: ClassMethodParameters<typeof ConnectionsModule, 'acceptRequest'>[0], thunkApi) => {
      await thunkApi.extra.agent.connections.acceptRequest(connectionId)
    }
  )

  export const acceptResponse = createAsyncAgentThunk(
    'connections/acceptResponse',
    async (connectionId: ClassMethodParameters<typeof ConnectionsModule, 'acceptRequest'>[0], thunkApi) => {
      return thunkApi.extra.agent.connections.acceptResponse(connectionId)
    }
  )
}

export { ConnectionThunks }
