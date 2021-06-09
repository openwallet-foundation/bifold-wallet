// import { createSlice, PayloadAction, SerializedError } from '@reduxjs/toolkit'
// import { CredentialRecord, ProposeCredentialMessage } from 'aries-framework'
import { createSlice, PayloadAction, SerializedError } from '@reduxjs/toolkit'
import { PresentationPreview, ProofRecord, ProofRequest, RequestedCredentials } from 'aries-framework'
import { ProofsThunks } from './ProofsThunks'

interface ProofsState {
  proofs: {
    records: ProofRecord[]
    isLoading: boolean
    error: null | SerializedError
  }
  proofRequest: {
    request: null | ProofRequest
    requestedCredentials: null | RequestedCredentials
    isLoading: boolean
  }
  presentationProposal: {
    preview: null | PresentationPreview
    connectionId: null | string
  }
  latestError: null | SerializedError
}

const initialState: ProofsState = {
  proofs: {
    records: [],
    isLoading: false,
    error: null,
  },
  proofRequest: {
    request: null,
    requestedCredentials: null,
    isLoading: false,
  },
  presentationProposal: {
    preview: null,
    connectionId: null,
  },
  latestError: null,
}

const proofsSlice = createSlice({
  name: 'proofs',
  initialState,
  reducers: {
    updateOrAdd: (state, action: PayloadAction<ProofRecord>) => {
      const index = state.proofs.records.findIndex((record: ProofRecord) => {
        record.id == action.payload.id
      })

      if (index == -1) {
        // records doesn't exist, add it
        state.proofs.records.push(action.payload)
        return state
      }

      // record does exist, update it
      state.proofs.records[index] = action.payload
      return state
    },
    setProofRequest: (
      state,
      action: PayloadAction<{
        proofRequest: ProofRequest
        requestedCredentials: RequestedCredentials
      }>
    ) => {
      state.proofRequest.request = action.payload.proofRequest
      state.proofRequest.requestedCredentials = action.payload.requestedCredentials
    },
    setPresentationProposal: (
      state,
      action: PayloadAction<{
        connectionId: string
        preview: PresentationPreview
      }>
    ) => {
      state.presentationProposal.connectionId = action.payload.connectionId
      state.presentationProposal.preview = action.payload.preview
    },
  },
  extraReducers: (builder) => {
    builder
      // getAllProofs
      .addCase(ProofsThunks.getAllProofs.pending, (state) => {
        state.proofs.isLoading = true
      })
      .addCase(ProofsThunks.getAllProofs.rejected, (state, action) => {
        state.proofs.isLoading = false
        state.proofs.error = action.error
        state.latestError = action.error
      })
      .addCase(ProofsThunks.getAllProofs.fulfilled, (state, action) => {
        state.proofs.isLoading = false
        state.proofs.records = action.payload
      })
      // proposeProof
      .addCase(ProofsThunks.proposeProof.pending, (state) => {
        state.proofs.isLoading = true
      })
      .addCase(ProofsThunks.proposeProof.rejected, (state, action) => {
        state.proofs.isLoading = false
        state.proofs.error = action.error
        state.latestError = action.error
      })
      .addCase(ProofsThunks.proposeProof.fulfilled, (state) => {
        state.proofs.isLoading = false
      })
      // acceptProposal
      .addCase(ProofsThunks.acceptProposal.pending, (state) => {
        state.proofs.isLoading = true
      })
      .addCase(ProofsThunks.acceptProposal.rejected, (state, action) => {
        state.proofs.isLoading = false
        state.proofs.error = action.error
        state.latestError = action.error
      })
      .addCase(ProofsThunks.acceptProposal.fulfilled, (state) => {
        state.proofs.isLoading = false
      })
      // requestProof
      .addCase(ProofsThunks.requestProof.pending, (state) => {
        state.proofs.isLoading = true
      })
      .addCase(ProofsThunks.requestProof.rejected, (state, action) => {
        state.proofs.isLoading = false
        state.proofs.error = action.error
        state.latestError = action.error
      })
      .addCase(ProofsThunks.requestProof.fulfilled, (state) => {
        state.proofs.isLoading = false
      })
      // acceptRequest
      .addCase(ProofsThunks.acceptRequest.pending, (state) => {
        state.proofs.isLoading = true
      })
      .addCase(ProofsThunks.acceptRequest.rejected, (state, action) => {
        state.proofs.isLoading = false
        state.proofs.error = action.error
        state.latestError = action.error
      })
      .addCase(ProofsThunks.acceptRequest.fulfilled, (state) => {
        state.proofs.isLoading = false
      })
      // acceptPresentation
      .addCase(ProofsThunks.acceptPresentation.pending, (state) => {
        state.proofs.isLoading = true
      })
      .addCase(ProofsThunks.acceptPresentation.rejected, (state, action) => {
        state.proofs.isLoading = false
        state.proofs.error = action.error
        state.latestError = action.error
      })
      .addCase(ProofsThunks.acceptPresentation.fulfilled, (state) => {
        state.proofs.isLoading = false
      })
      // getRequestedCredentialsForProofRequest
      .addCase(ProofsThunks.getRequestedCredentialsForProofRequest.pending, (state) => {
        state.proofRequest.isLoading = true
      })
      .addCase(ProofsThunks.getRequestedCredentialsForProofRequest.rejected, (state, action) => {
        state.proofRequest.isLoading = false
        state.proofs.error = action.error
        state.latestError = action.error
      })
      .addCase(ProofsThunks.getRequestedCredentialsForProofRequest.fulfilled, (state, action) => {
        state.proofRequest.isLoading = false
        state.proofRequest.requestedCredentials = action.payload
      })
  },
})

export { proofsSlice }

export type { ProofsState }
