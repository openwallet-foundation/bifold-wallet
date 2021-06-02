import { createSlice, PayloadAction, SerializedError } from '@reduxjs/toolkit'
import { ConnectionInvitationMessage } from 'aries-framework'
import { ConnectionRecord } from 'aries-framework'
import {
  createConnection,
  fetchAllConnections,
  receiveInvitation,
  receiveInvitationFromUrl,
  acceptInvitation
} from './connectionsThunks'

interface ConnectionsState {
  connections: {
    records: ConnectionRecord[]
    isLoading: boolean
  }
  invitation: {
    message: null | ConnectionInvitationMessage,
    isLoading: boolean
  }
  error: null | SerializedError
}

const initialState: ConnectionsState = {
  connections: {
    records: [],
    isLoading: false
  },
  invitation: {
    message: null,
    isLoading: false
  },
  error: null
}

const connectionsSlice = createSlice({
  name: 'connections',
  initialState,
  reducers: {
    updateOrAdd: (state, action: PayloadAction<ConnectionRecord>) => {
      const index = state.connections.records.findIndex((record: ConnectionRecord) => {
        record.id == action.payload.id
      })

      if (index == -1) {
        // records doesn't exist, add it
        state.connections.records.push(action.payload)
        return state
      }

      // record does exist, update it
      state.connections.records[index] = action.payload
      return state
    }

  },
  extraReducers: (builder) => {
    builder
      // fetchAllConnections
      .addCase(fetchAllConnections.pending, (state) => {
        state.connections.isLoading = true
      })
      .addCase(fetchAllConnections.rejected, (state, action) => {
        state.connections.isLoading = false
        state.error = action.error
      })
      .addCase(fetchAllConnections.fulfilled, (state, action) => {
        state.connections.isLoading = false
        state.connections.records = action.payload
      })
      // createConnection
      .addCase(createConnection.pending, (state) => {
        state.connections.isLoading = true
        state.invitation.isLoading = true
      })
      .addCase(createConnection.rejected, (state, action) => {
        state.invitation.isLoading = false
        state.error = action.error
      })
      .addCase(createConnection.fulfilled, (state, action) => {
        state.invitation.isLoading = false
        state.invitation.message = action.payload.invitation
        state.connections.records.push(action.payload.connectionRecord)
      })
      // receiveInvitation
      .addCase(receiveInvitation.pending, (state) => {
        state.invitation.isLoading = true
      })
      .addCase(receiveInvitation.rejected, (state, action) => {
        state.invitation.isLoading = false
        state.error = action.error
      })
      .addCase(receiveInvitation.fulfilled, (state, action) => {
        state.invitation.isLoading = false
      })
      // receiveInvitationFromUrl
      .addCase(receiveInvitationFromUrl.pending, (state) => {
        state.invitation.isLoading = true
      })
      .addCase(receiveInvitationFromUrl.rejected, (state, action) => {
        state.invitation.isLoading = false
        state.error = action.error
      })
      .addCase(receiveInvitationFromUrl.fulfilled, (state) => {
        state.invitation.isLoading = false
      })
      // acceptInvitation
      .addCase(acceptInvitation.pending, (state) => {
        state.invitation.isLoading = true
      })
      .addCase(acceptInvitation.rejected, (state, action) => {
        state.invitation.isLoading = false
        state.error = action.error
      })
      .addCase(acceptInvitation.fulfilled, (state) => {
        state.invitation.isLoading = false
      })

  },
})

export { connectionsSlice }
