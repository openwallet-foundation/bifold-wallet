import { ConnectionInvitationMessage } from 'aries-framework'
import { createAsyncAgentThunk } from '../../utils'



namespace ConnectionThunks {

  export const fetchAllConnections = createAsyncAgentThunk(
    'connections/fetchAll',
    async (_, thunkApi) => {
      return thunkApi.extra.agent.connections.getAll()
    })

  export const createConnection = createAsyncAgentThunk(
    'connections/createConnection',
    async (config: {
      autoAcceptConnection?: boolean,
      alias?: string
    }, thunkApi) => {
      return thunkApi.extra.agent.connections.createConnection(config)
    })

  export const receiveInvitation = createAsyncAgentThunk(
    'connections/receiveInvitation',
    async (options: {
      invitation: ConnectionInvitationMessage,
      config?: {
        autoAcceptConnection?: boolean,
        alias?: string
      }
    }, thunkApi) => {
      await thunkApi.extra.agent.connections.receiveInvitation(options.invitation, options.config)
    })

  export const receiveInvitationFromUrl = createAsyncAgentThunk(
    'connections/receiveInvitationFromUrl',
    async (options: {
      invitationUrl: string,
      config?: {
        autoAcceptConnection?: boolean,
        alias?: string
      }
    }, thunkApi) => {
      await thunkApi.extra.agent.connections.receiveInvitationFromUrl(options.invitationUrl, options.config)
    })

  export const acceptInvitation = createAsyncAgentThunk(
    'connections/acceptInvitation',
    async (options: {
      connectionId: string
    }, thunkApi) => {
      await thunkApi.extra.agent.connections.acceptInvitation(options.connectionId)
    })

  export const acceptRequest = createAsyncAgentThunk(
    'connections/acceptRequest',
    async (options: {
      connectionId: string
    }, thunkApi) => {
      await thunkApi.extra.agent.connections.acceptRequest(options.connectionId)
    })

  export const acceptResponse = createAsyncAgentThunk(
    'connections/acceptResponse',
    async (options: {
      connectionId: string
    }, thunkApi) => {
      return thunkApi.extra.agent.connections.acceptResponse(options.connectionId)
    })

}

export {
  ConnectionThunks
}
