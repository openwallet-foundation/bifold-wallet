import { ConnectionInvitationMessage } from 'aries-framework'
import { createAsyncAgentThunk } from '../../utils'

const fetchAllConnections = createAsyncAgentThunk(
  'connections/fetchAll',
  async (_, thunkApi) => {
    return thunkApi.extra.agent.connections.getAll()
})

const createConnection = createAsyncAgentThunk(
  'connections/createConnection',
  async (config: {
    autoAcceptConnection?: boolean,
    alias?: string
  }, thunkApi) => {
    return thunkApi.extra.agent.connections.createConnection(config)
})

const receiveInvitation = createAsyncAgentThunk(
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

const receiveInvitationFromUrl = createAsyncAgentThunk(
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

const acceptInvitation = createAsyncAgentThunk(
  'connections/acceptInvitation',
  async (options: {
    connectionId: string
  }, thunkApi) => {
    await thunkApi.extra.agent.connections.acceptInvitation(options.connectionId)
})

const acceptRequest = createAsyncAgentThunk(
  'connections/acceptRequest',
  async (options: {
    connectionId: string
  }, thunkApi) => {
    await thunkApi.extra.agent.connections.acceptRequest(options.connectionId)
})

const acceptResponse = createAsyncAgentThunk(
  'connections/acceptResponse',
  async (options: {
    connectionId: string
  }, thunkApi) => {
    return thunkApi.extra.agent.connections.acceptResponse(options.connectionId)
})

export {
  fetchAllConnections,
  createConnection,
  receiveInvitation,
  receiveInvitationFromUrl,
  acceptInvitation,
  acceptRequest,
  acceptResponse
}
