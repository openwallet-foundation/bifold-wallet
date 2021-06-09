import { createSlice, PayloadAction, SerializedError } from '@reduxjs/toolkit'
import { CredentialRecord, ProposeCredentialMessage } from 'aries-framework'
import { CredentialsThunks } from './CredentialsThunks'

interface CredentialsState {
  credentials: {
    records: CredentialRecord[]
    isLoading: boolean
    error: null | SerializedError
  }
  proposal: {
    message: null | ProposeCredentialMessage
    credentialRecordId: null | string
    isLoading: boolean
    error: null | SerializedError
  }
  latestError: null | SerializedError
}

const initialState: CredentialsState = {
  credentials: {
    records: [],
    isLoading: false,
    error: null,
  },
  proposal: {
    message: null,
    credentialRecordId: null,
    isLoading: false,
    error: null,
  },
  latestError: null,
}

const credentialsSlice = createSlice({
  name: 'credentials',
  initialState,
  reducers: {
    updateOrAdd: (state, action: PayloadAction<CredentialRecord>) => {
      const index = state.credentials.records.findIndex((record: CredentialRecord) => {
        record.id == action.payload.id
      })

      if (index == -1) {
        // records doesn't exist, add it
        state.credentials.records.push(action.payload)
        return state
      }

      // record does exist, update it
      state.credentials.records[index] = action.payload
      return state
    },
  },
  extraReducers: (builder) => {
    builder
      // getAllCredentials
      .addCase(CredentialsThunks.getAllCredentials.pending, (state) => {
        state.credentials.isLoading = true
      })
      .addCase(CredentialsThunks.getAllCredentials.rejected, (state, action) => {
        state.credentials.isLoading = false
        state.credentials.error = action.error
        state.latestError = action.error
      })
      .addCase(CredentialsThunks.getAllCredentials.fulfilled, (state, action) => {
        state.credentials.isLoading = false
        state.credentials.records = action.payload
      })
      // proposeCredential
      .addCase(CredentialsThunks.proposeCredential.pending, (state) => {
        state.credentials.isLoading = true
      })
      .addCase(CredentialsThunks.proposeCredential.rejected, (state, action) => {
        state.credentials.isLoading = false
        state.credentials.error = action.error
        state.latestError = action.error
      })
      .addCase(CredentialsThunks.proposeCredential.fulfilled, (state) => {
        state.credentials.isLoading = false
      })
      // acceptProposal
      .addCase(CredentialsThunks.acceptProposal.pending, (state) => {
        state.credentials.isLoading = true
      })
      .addCase(CredentialsThunks.acceptProposal.rejected, (state, action) => {
        state.credentials.isLoading = false
        state.credentials.error = action.error
        state.latestError = action.error
      })
      .addCase(CredentialsThunks.acceptProposal.fulfilled, (state) => {
        state.credentials.isLoading = false
      })
      // offerCredential
      .addCase(CredentialsThunks.offerCredential.pending, (state) => {
        state.credentials.isLoading = true
      })
      .addCase(CredentialsThunks.offerCredential.rejected, (state, action) => {
        state.credentials.isLoading = false
        state.credentials.error = action.error
        state.latestError = action.error
      })
      .addCase(CredentialsThunks.offerCredential.fulfilled, (state) => {
        state.credentials.isLoading = false
      })
      // acceptOffer
      .addCase(CredentialsThunks.acceptOffer.pending, (state) => {
        state.credentials.isLoading = true
      })
      .addCase(CredentialsThunks.acceptOffer.rejected, (state, action) => {
        state.credentials.isLoading = false
        state.credentials.error = action.error
        state.latestError = action.error
      })
      .addCase(CredentialsThunks.acceptOffer.fulfilled, (state) => {
        state.credentials.isLoading = false
      })
      // acceptRequest
      .addCase(CredentialsThunks.acceptRequest.pending, (state) => {
        state.credentials.isLoading = true
      })
      .addCase(CredentialsThunks.acceptRequest.rejected, (state, action) => {
        state.credentials.isLoading = false
        state.credentials.error = action.error
        state.latestError = action.error
      })
      .addCase(CredentialsThunks.acceptRequest.fulfilled, (state) => {
        state.credentials.isLoading = false
      })
      // acceptCredential
      .addCase(CredentialsThunks.acceptCredential.pending, (state) => {
        state.credentials.isLoading = true
      })
      .addCase(CredentialsThunks.acceptCredential.rejected, (state, action) => {
        state.credentials.isLoading = false
        state.credentials.error = action.error
        state.latestError = action.error
      })
      .addCase(CredentialsThunks.acceptCredential.fulfilled, (state) => {
        state.credentials.isLoading = false
      })
  },
})

export { credentialsSlice }

export type { CredentialsState }
